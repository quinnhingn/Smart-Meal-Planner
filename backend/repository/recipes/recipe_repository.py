import unicodedata
from model.recipes.recipe_model import RecipeModel, DishCaloriesModel, MealLogModel
from database.db import db
from sqlalchemy import func
from datetime import datetime, date

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
    def get_daily_summary(user_id):
        """
        Tính tổng calo và lấy danh sách món đã ăn trong ngày hôm nay (Theo giờ VN - GMT+7)
        """
        print(f"📊 [Dashboard] Đang lấy thống kê cho User: {user_id}")
        
        # DEBUG: Kiểm tra xem User này có tổng cộng bao nhiêu bản ghi trong DB
        all_logs_count = MealLogModel.query.filter_by(user_id=user_id).count()
        print(f"🔍 [Debug] Tổng số bản ghi của User này trong DB: {all_logs_count}")
        
        # 1. Tính tổng
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
        
        print(f"✅ [Dashboard] Kết quả: {len(logs)} món ăn, Tổng Calo: {summary.total_calories or 0}")
        
        return {
            "totals": {
                "calories": float(summary.total_calories or 0),
                "protein": float(summary.total_protein or 0),
                "carbs": float(summary.total_carbs or 0),
                "fat": float(summary.total_fat or 0)
            },
            "meals": [
                {
                    "id": log.id,
                    "name": log.meal_name,
                    "type": log.meal_type,
                    "calories": log.calories_consumed,
                    "time": log.eaten_at.strftime('%H:%M')
                } for log in logs
            ]
        }
