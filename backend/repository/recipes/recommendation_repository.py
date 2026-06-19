from model.auth.user_profile_model import UserProfileModel
from model.recipes.recipe_model import RecipeModel, DishCaloriesModel, MealLogModel
from database.db import db
from datetime import date
import math
import json

class RecommendationRepository:
    @staticmethod
    def get_macro_recommendations(user_id, meal_type):
        """
        Tính toán gợi ý món ăn bù macro sử dụng Cosine Similarity và Coverage Score.
        """
        # 1. Lấy thông tin user profile để biết target
        profile = UserProfileModel.query.filter_by(user_id=user_id).first()
        if not profile:
            return {"status": "error", "message": "Không tìm thấy hồ sơ người dùng."}

        target_p = float(profile.target_protein_g or 0)
        target_c = float(profile.target_carbs_g or 0)
        target_f = float(profile.target_fat_g or 0)

        # 2. Lấy lượng macro đã tiêu thụ hôm nay
        logs_today = MealLogModel.query.filter(
            MealLogModel.user_id == user_id,
            db.func.date(db.func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)) == db.func.date(db.func.timezone('Asia/Ho_Chi_Minh', db.func.now()))
        ).all()

        consumed_p = sum(float(log.protein_g or 0) for log in logs_today)
        consumed_c = sum(float(log.carbs_g or 0) for log in logs_today)
        consumed_f = sum(float(log.fat_g or 0) for log in logs_today)

        # -- SMART MACRO-AWARE LOGIC --
        p_ratio = consumed_p / target_p if target_p else 0
        c_ratio = consumed_c / target_c if target_c else 0
        f_ratio = consumed_f / target_f if target_f else 0

        ratios = {'protein': p_ratio, 'carbs': c_ratio, 'fat': f_ratio}
        max_macro = max(ratios, key=ratios.get)
        max_ratio = ratios[max_macro]

        penalty_macro = None
        smart_message = "Đây là các món tuyệt ngon được tinh tuyển dựa trên quỹ Calo hiện tại của bạn 🍲"

        if max_ratio > 1.05:
            penalty_macro = max_macro
            if max_macro == 'fat':
                smart_message = "Chỉ số Fat của bạn đang vượt ngưỡng! Xem ngay các gợi ý thanh đạm, ít dầu mỡ dưới đây nhé "
            elif max_macro == 'carbs':
                smart_message = "Lượng Tinh bột hôm nay hơi cao rồi đó! Thử ngay các món Low-carb để cân bằng lại nhé "
            else:
                smart_message = "Bạn nạp khá nhiều Đạm rồi đấy! Đổi vị với các món giàu xơ, nhẹ bụng hơn xem sao "
        elif max_ratio > 0.85 and min(ratios.values()) > 0.85:
            smart_message = "Tuyệt vời! Các chỉ số đều đang ở mức lý tưởng. Dưới đây là các món giúp bạn giữ vững phong độ "
        # -----------------------------

        # 3. Tính Gap
        gap_p = max(0, target_p - consumed_p)
        gap_c = max(0, target_c - consumed_c)
        gap_f = max(0, target_f - consumed_f)

        v_gap = (gap_p, gap_c, gap_f)

        # Nếu đã đủ macro
        if sum(v_gap) == 0:
            return {"status": "success", "message": "Bạn đã đạt đủ mục tiêu macro hôm nay 🎉", "data": []}

        norm_gap = math.sqrt(gap_p**2 + gap_c**2 + gap_f**2)
        epsilon = 1.0

        # 4. Truy vấn tất cả công thức và tính điểm
        all_recipes = RecipeModel.query.filter_by(item_type='recipe').all()
        scored_recipes = []

        for recipe in all_recipes:
            # Lọc theo meal_type
            if meal_type:
                meal_times = recipe.meal_times or []
                if meal_type not in meal_times:
                    continue

            nutrition = recipe.nutrition
            if not nutrition:
                continue

            try:
                servings = float(recipe.servings) if recipe.servings else 1.0
                if servings <= 0: servings = 1.0
            except ValueError:
                servings = 1.0

            # V_food: macro tính cho 1 serving (vì dữ liệu lưu cho toàn bộ công thức)
            v_food_p = float(nutrition.protein or 0) / servings
            v_food_c = float(nutrition.carbs or 0) / servings
            v_food_f = float(nutrition.fat or 0) / servings

            norm_food = math.sqrt(v_food_p**2 + v_food_c**2 + v_food_f**2)
            if norm_food == 0:
                continue

            # Cosine Similarity
            dot_product = (gap_p * v_food_p) + (gap_c * v_food_c) + (gap_f * v_food_f)
            cos_sim = dot_product / (norm_gap * norm_food)

            # Coverage Score
            cov_p = min(v_food_p / gap_p, 1.0) if gap_p > 0 else (1.0 if v_food_p == 0 else 0.0)
            cov_c = min(v_food_c / gap_c, 1.0) if gap_c > 0 else (1.0 if v_food_c == 0 else 0.0)
            cov_f = min(v_food_f / gap_f, 1.0) if gap_f > 0 else (1.0 if v_food_f == 0 else 0.0)
            coverage = (cov_p + cov_c + cov_f) / 3.0

            # Điểm tổng hợp
            score = 0.6 * cos_sim + 0.4 * coverage

            # Áp dụng phạt điểm nếu có macro bị lố
            if penalty_macro == 'fat':
                score -= (v_food_f * 0.05)
            elif penalty_macro == 'carbs':
                score -= (v_food_c * 0.05)
            elif penalty_macro == 'protein':
                score -= (v_food_p * 0.05)

            if score < 0:
                score = 0

            # Lọc các món có Coverage quá thấp
            if coverage < 0.05:
                continue

            # Parse ingredients and steps from JSON strings (if needed)
            ingredients = recipe.ingredients if isinstance(recipe.ingredients, list) else json.loads(recipe.ingredients or '[]')
            steps = recipe.steps if isinstance(recipe.steps, list) else json.loads(recipe.steps or '[]')

            # Format ingredients
            formatted_ingredients = []
            for ing in ingredients:
                formatted_ingredients.append({
                    "name": ing.get('name', ''),
                    "amount": f"{ing.get('grams', 0)}g" if ing.get('grams') else ing.get('amount', '100g'),
                    "calories": round(ing.get('calories') or ing.get('cal') or 0, 1),
                    "protein": round(ing.get('protein', 0), 1),
                    "carbs": round(ing.get('carbs') or ing.get('carb') or 0, 1),
                    "fat": round(ing.get('fat', 0), 1)
                })

            # Format steps
            formatted_steps = []
            for i, step in enumerate(steps):
                if isinstance(step, str):
                    formatted_steps.append({"order": i + 1, "description": step})
                else:
                    formatted_steps.append(step)

            fill_percent_p = min(round((v_food_p / gap_p) * 100), 100) if gap_p > 0 else (100 if v_food_p == 0 else 0)
            fill_percent_c = min(round((v_food_c / gap_c) * 100), 100) if gap_c > 0 else (100 if v_food_c == 0 else 0)
            fill_percent_f = min(round((v_food_f / gap_f) * 100), 100) if gap_f > 0 else (100 if v_food_f == 0 else 0)

            scored_recipes.append({
                "id": str(recipe.id),
                "name": recipe.name_vn,
                "image": recipe.image_url,
                "time": str(recipe.cooking_time),
                "servings": str(recipe.servings),
                "difficulty": recipe.difficulty or "Dễ",
                "item_type": recipe.item_type,
                "ingredients": formatted_ingredients,
                "steps": formatted_steps,
                "reviews": {"avgRating": 4.8, "total": 124},
                "calories": round(nutrition.calories / servings),
                "match_percent": round(score * 100),
                "fill_percent": {
                    "protein": fill_percent_p,
                    "carbs": fill_percent_c,
                    "fat": fill_percent_f
                },
                "macros": {
                    "calories": round(nutrition.calories / servings),
                    "protein": round(v_food_p),
                    "carbs": round(v_food_c),
                    "fat": round(v_food_f)
                },
                "score": score
            })

        # 5. Sắp xếp và lấy Top 5
        scored_recipes.sort(key=lambda x: x['score'], reverse=True)
        top_5 = scored_recipes[:5]

        return {"status": "success", "message": smart_message, "data": top_5}

    @staticmethod
    def explain_recommendation(user_id, recipe_id, meal_type):
        """
        Explain recommendation for a specific recipe
        """
        profile = UserProfileModel.query.filter_by(user_id=user_id).first()
        if not profile:
            return {"status": "error", "message": "Không tìm thấy hồ sơ người dùng."}

        target_p = float(profile.target_protein_g or 0)
        target_c = float(profile.target_carbs_g or 0)
        target_f = float(profile.target_fat_g or 0)

        logs_today = MealLogModel.query.filter(
            MealLogModel.user_id == user_id,
            db.func.date(db.func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)) == db.func.date(db.func.timezone('Asia/Ho_Chi_Minh', db.func.now()))
        ).all()

        consumed_p = sum(float(log.protein_g or 0) for log in logs_today)
        consumed_c = sum(float(log.carbs_g or 0) for log in logs_today)
        consumed_f = sum(float(log.fat_g or 0) for log in logs_today)

        gap_p = max(0, target_p - consumed_p)
        gap_c = max(0, target_c - consumed_c)
        gap_f = max(0, target_f - consumed_f)
        
        recipe = RecipeModel.query.get(recipe_id)
        if not recipe or not recipe.nutrition:
            return {"status": "error", "message": "Không tìm thấy món ăn."}

        try:
            servings = float(recipe.servings) if recipe.servings else 1.0
            if servings <= 0: servings = 1.0
        except ValueError:
            servings = 1.0

        v_food_p = float(recipe.nutrition.protein or 0) / servings
        v_food_c = float(recipe.nutrition.carbs or 0) / servings
        v_food_f = float(recipe.nutrition.fat or 0) / servings

        norm_gap = math.sqrt(gap_p**2 + gap_c**2 + gap_f**2)
        norm_food = math.sqrt(v_food_p**2 + v_food_c**2 + v_food_f**2)
        epsilon = 1.0

        if norm_gap == 0:
            cos_sim = 0
            coverage = 0
            score = 0
        elif norm_food == 0:
            cos_sim = 0
            coverage = 0
            score = 0
        else:
            dot_product = (gap_p * v_food_p) + (gap_c * v_food_c) + (gap_f * v_food_f)
            cos_sim = dot_product / (norm_gap * norm_food)
            cov_p = min(v_food_p / gap_p, 1.0) if gap_p > 0 else (1.0 if v_food_p == 0 else 0.0)
            cov_c = min(v_food_c / gap_c, 1.0) if gap_c > 0 else (1.0 if v_food_c == 0 else 0.0)
            cov_f = min(v_food_f / gap_f, 1.0) if gap_f > 0 else (1.0 if v_food_f == 0 else 0.0)
            coverage = (cov_p + cov_c + cov_f) / 3.0
            score = 0.6 * cos_sim + 0.4 * coverage

        fill_percent_p = min(round((v_food_p / gap_p) * 100), 100) if gap_p > 0 else (100 if v_food_p == 0 else 0)
        fill_percent_c = min(round((v_food_c / gap_c) * 100), 100) if gap_c > 0 else (100 if v_food_c == 0 else 0)
        fill_percent_f = min(round((v_food_f / gap_f) * 100), 100) if gap_f > 0 else (100 if v_food_f == 0 else 0)

        # Trả về breakdown
        return {
            "status": "success",
            "data": {
                "match_percent": round(score * 100),
                "breakdown": {
                    "protein": { "gap_g": round(gap_p), "food_g": round(v_food_p), "fill_percent": fill_percent_p },
                    "carbs": { "gap_g": round(gap_c), "food_g": round(v_food_c), "fill_percent": fill_percent_c },
                    "fat": { "gap_g": round(gap_f), "food_g": round(v_food_f), "fill_percent": fill_percent_f }
                }
            }
        }
