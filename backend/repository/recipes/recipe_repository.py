from model.recipes.recipe_model import RecipeModel, DishCaloriesModel, MealLogModel, UserPantryModel
from database.db import db
from sqlalchemy import func
from datetime import datetime, date, timedelta
import unicodedata
import json

class RecipeRepository:
    @staticmethod
    def find_by_name_with_nutrition(search_name):
        """
        Tìm món ăn theo tên tiếng Việt (Chuẩn hóa NFC để so khớp chính xác)
        """
        all_recipes = RecipeModel.query.all()
        
        # Chuẩn hóa tên tìm kiếm
        normalized_search = unicodedata.normalize('NFC', search_name).lower().strip()
        
        target_recipe = None
        for r in all_recipes:
            # Chuẩn hóa tên trong DB
            name_db = unicodedata.normalize('NFC', r.name_vn).lower().strip()
            if normalized_search in name_db or name_db in normalized_search:
                target_recipe = r
                break
        
        if not target_recipe:
            print(f"❌ [DB Lookup] Không tìm thấy món nào khớp với '{search_name}'")
            return None
            
        print(f"✅ [DB Lookup] Đã tìm thấy: {target_recipe.name_vn} (ID: {target_recipe.id})")
        
        return {
            "id": target_recipe.id,
            "name": target_recipe.name_vn,
            "image": target_recipe.image_url,
            "servings": target_recipe.servings,
            "nutrition": target_recipe.nutrition.to_dict() if target_recipe.nutrition else {
                "calories": 0, "protein": 0, "carbs": 0, "fat": 0
            }
        }
        
    @staticmethod
    def get_pantry_suggestions(user_id):
        """
        Gợi ý món ăn dựa trên nguyên liệu sắp hỏng trong tủ lạnh
        """
        try:
            # 1. Lấy nguyên liệu sắp hỏng trong tủ lạnh (hạn < 5 ngày)
            today = date.today()
            expiring_date = today + timedelta(days=5)
            
            pantry_items = UserPantryModel.query.filter(
                UserPantryModel.user_id == user_id,
                UserPantryModel.expiry_date != None,
                UserPantryModel.expiry_date <= expiring_date,
                UserPantryModel.expiry_date >= today
            ).all()
            
            # Nếu không có đồ sắp hỏng, lấy ngẫu nhiên đồ trong tủ
            if not pantry_items:
                pantry_items = UserPantryModel.query.filter(UserPantryModel.user_id == user_id).limit(5).all()
                
            if not pantry_items:
                return [] # Tủ lạnh trống
                
            ingredient_names = [unicodedata.normalize('NFC', item.ingredient_name).lower().strip() for item in pantry_items]
            
            # 2. Tìm công thức có chứa các nguyên liệu này
            all_recipes = RecipeModel.query.all()
            suggestions = []
            
            for r in all_recipes:
                try:
                    # Kiểm tra xem nguyên liệu của món này có khớp với đồ trong tủ không
                    recipe_ingredients = r.ingredients if isinstance(r.ingredients, list) else json.loads(r.ingredients or '[]')
                    recipe_ing_names = [unicodedata.normalize('NFC', ing.get('name', '')).lower().strip() for ing in recipe_ingredients]
                    
                    # Đếm số nguyên liệu khớp
                    match_count = 0
                    for req_ing in recipe_ing_names:
                        for pan_ing in ingredient_names:
                            if pan_ing in req_ing or req_ing in pan_ing:
                                match_count += 1
                                break
                                
                    if match_count > 0:
                        suggestions.append({
                            "recipe": r,
                            "match_count": match_count
                        })
                except Exception as e:
                    continue
            
            # 3. Sắp xếp theo số nguyên liệu khớp nhiều nhất và lấy top 3
            suggestions.sort(key=lambda x: x["match_count"], reverse=True)
            top_recipes = [s["recipe"] for s in suggestions[:3]]
            
            return [
                {
                    "id": str(r.id),
                    "name": r.name_vn,
                    "image": r.image_url,
                    "time": r.steps[0][:15] + '...' if r.steps and len(r.steps) > 0 else '15 phút', # Mock time
                    "difficulty": 'Dễ', # Mock difficulty
                } for r in top_recipes
            ]
        except Exception as e:
            print(f"❌ [Suggestion Error] {e}")
            return []
    @staticmethod
    def get_daily_summary(user_id):
        """
        Tính tổng calo và lấy danh sách món đã ăn trong ngày hôm nay (Theo giờ VN)
        """
        try:
            print(f"📊 [Dashboard] Đang lấy thống kê cho User: {user_id}")
            
            # 1. Tính tổng (Chuyển về múi giờ VN để so khớp ngày)
            summary = db.session.query(
                func.sum(MealLogModel.calories_consumed).label('total_calories'),
                func.sum(MealLogModel.protein_g).label('total_protein'),
                func.sum(MealLogModel.carbs_g).label('total_carbs'),
                func.sum(MealLogModel.fat_g).label('total_fat')
            ).filter(
                MealLogModel.user_id == user_id,
                func.date(func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)) == func.date(func.timezone('Asia/Ho_Chi_Minh', func.now()))
            ).first()
            
            # 2. Lấy danh sách món
            logs = MealLogModel.query.filter(
                MealLogModel.user_id == user_id,
                func.date(func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)) == func.date(func.timezone('Asia/Ho_Chi_Minh', func.now()))
            ).order_by(MealLogModel.eaten_at.desc()).all()
            
            # 3. Tính Chuỗi (Streak)
            streak = 0
            has_logged_today = False
            try:
                # Lấy danh sách các ngày có log (đã chuyển sang múi giờ VN)
                distinct_days = db.session.query(
                    func.date(func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)).label('log_date')
                ).filter(MealLogModel.user_id == user_id).distinct().order_by(func.desc('log_date')).all()
                
                # Ngày hôm nay theo múi giờ VN
                today_vn = db.session.query(func.date(func.timezone('Asia/Ho_Chi_Minh', func.now()))).scalar()
                
                print(f"📅 [Streak Debug] Today VN: {today_vn}, Last Log Day: {distinct_days[0].log_date if distinct_days else 'None'}")

                if distinct_days:
                    # Chuyển về string để so sánh cho chắc chắn
                    last_log_str = str(distinct_days[0].log_date)
                    today_str = str(today_vn)
                    
                    if last_log_str == today_str:
                        has_logged_today = True
                        streak = 1
                        for i in range(1, len(distinct_days)):
                            # Kiểm tra liên tiếp (Dùng date object để trừ)
                            diff = distinct_days[i-1].log_date - distinct_days[i].log_date
                            if diff.days == 1:
                                streak += 1
                            else: break
                    elif (today_vn - distinct_days[0].log_date).days == 1:
                        # Nếu hôm nay chưa ăn nhưng hôm qua có ăn thì vẫn giữ chuỗi cũ
                        streak = 1
                        for i in range(1, len(distinct_days)):
                            diff = distinct_days[i-1].log_date - distinct_days[i].log_date
                            if diff.days == 1:
                                streak += 1
                            else: break
            except Exception as streak_err:
                print(f"⚠️ [Streak Error] {streak_err}")

            # FALLBACK: Nếu danh sách logs hôm nay có data mà streak vẫn 0 thì ép lên 1
            if len(logs) > 0 and streak == 0:
                streak = 1
                has_logged_today = True

            print(f"✅ [Dashboard] Kết quả: {len(logs)} món ăn, Chuỗi: {streak} ngày")

            return {
                "totals": {
                    "calories": float(summary.total_calories or 0),
                    "protein": float(summary.total_protein or 0),
                    "carbs": float(summary.total_carbs or 0),
                    "fat": float(summary.total_fat or 0)
                },
                "meals": [
                    {
                        "id": str(log.id),
                        "name": log.meal_name,
                        "type": log.meal_type,
                        "calories": log.calories_consumed,
                        "time": log.eaten_at.strftime('%H:%M')
                    } for log in logs
                ],
                "streak": streak,
                "hasLoggedToday": has_logged_today
            }
        except Exception as e:
            print(f"❌ [Dashboard Error] {e}")
            return {"totals": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}, "meals": [], "streak": 0, "hasLoggedToday": False}

    @staticmethod
    def get_all_recipes():
        """
        Lấy danh sách tất cả món ăn, bao gồm cả thông tin dinh dưỡng từ bảng scr_dishes_calories
        """
        try:
            recipes = RecipeModel.query.all()
            result = []
            for r in recipes:
                # Ép kiểu JSON nếu nó đang ở dạng string (phòng hờ SQLite hoặc driver cũ)
                ingredients = r.ingredients if isinstance(r.ingredients, list) else json.loads(r.ingredients or '[]')
                steps = r.steps if isinstance(r.steps, list) else json.loads(r.steps or '[]')
                
                # Chuyển đổi sang format mà Frontend đang dùng (labels, macros)
                labels = []
                if r.category: labels.append(r.category)
                
                # Ánh xạ meal_times sang tiếng Việt cho đẹp
                meal_map = {"breakfast": "Bữa sáng", "lunch": "Bữa trưa", "dinner": "Bữa tối", "snack": "Bữa phụ"}
                if r.meal_times:
                    m_times = r.meal_times if isinstance(r.meal_times, list) else json.loads(r.meal_times or '[]')
                    for mt in m_times:
                        if mt in meal_map: labels.append(meal_map[mt])
                
                # Ánh xạ goals
                goal_map = {"lose": "Giảm cân", "gain": "Tăng cân", "keto": "Keto", "vegan": "Chay"}
                if r.goals:
                    g_list = r.goals if isinstance(r.goals, list) else json.loads(r.goals or '[]')
                    for g in g_list:
                        if g in goal_map: labels.append(goal_map[g])
                
                # Chuyển đổi Ingredients sang format Frontend (có trường 'amount')
                formatted_ingredients = []
                for ing in ingredients:
                    formatted_ingredients.append({
                        "name": ing.get('name', ''),
                        "amount": f"{ing.get('grams', 0)}g" if ing.get('grams') else ing.get('amount', '100g'),
                        "calories": round(ing.get('calories', 0), 1),
                        "protein": round(ing.get('protein', 0), 1),
                        "carbs": round(ing.get('carbs', 0), 1),
                        "fat": round(ing.get('fat', 0), 1)
                    })

                # Chuyển đổi Steps sang format object {order, description}
                formatted_steps = []
                for i, step in enumerate(steps):
                    if isinstance(step, str):
                        formatted_steps.append({"order": i + 1, "description": step})
                    else:
                        formatted_steps.append(step)

                # Làm tròn các chỉ số macros cho đẹp
                raw_macros = r.nutrition.to_dict() if r.nutrition else {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
                macros = {k: round(v, 1) for k, v in raw_macros.items()}

                # Trích xuất số phút từ chuỗi "30 phút" để Frontend format được
                try:
                    cook_time_str = r.cooking_time or "25"
                    # Lấy tất cả chữ số trong chuỗi
                    cook_time = int(''.join(filter(str.isdigit, cook_time_str)))
                except:
                    cook_time = 25

                result.append({
                    "id": r.id,
                    "title": r.name_vn,
                    "image": r.image_url or "https://via.placeholder.com/150",
                    "videoUrl": r.video_url,
                    "cookTime": cook_time,
                    "servings": r.servings or "2",
                    "difficulty": r.difficulty or "Dễ",
                    "author": {"name": "SmartMeal Admin", "avatar": "https://i.pravatar.cc/150?u=admin"},
                    "labels": labels,
                    "macros": macros,
                    "ingredients": formatted_ingredients,
                    "steps": formatted_steps,
                    "reviews": {"avgRating": 5.0, "total": 0}
                })
            return result
        except Exception as e:
            print(f"❌ [Get All Recipes Error] {e}")
            return []
