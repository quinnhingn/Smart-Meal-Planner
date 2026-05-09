import unicodedata
from model.recipes.recipe_model import RecipeModel, DishCaloriesModel, MealLogModel
from database.db import db
from sqlalchemy import func
from datetime import datetime, date, timedelta

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
