import unicodedata
from model.recipes.recipe_model import RecipeModel, DishCaloriesModel
from database.db import db
from sqlalchemy import func

class RecipeRepository:
    @staticmethod
    def normalize_vietnamese(text):
        if not text:
            return ""
        # Chuẩn hóa về dạng NFC (Dạng chuẩn của tiếng Việt)
        return unicodedata.normalize('NFC', text)

    @staticmethod
    def find_by_name_with_nutrition(name_vn):
        """
        Tìm món ăn theo tên tiếng Việt và lấy kèm thông tin dinh dưỡng
        """
        search_name = RecipeRepository.normalize_vietnamese(name_vn.strip())
        print(f"🔎 [DB Lookup] Đang tìm kiếm món: '{search_name}'")
        
        # Lấy tất cả recipe ra rồi so sánh ở mức Python cho chắc cú về Unicode
        recipes = RecipeModel.query.all()
        
        target_recipe = None
        for r in recipes:
            db_name = RecipeRepository.normalize_vietnamese(r.name_vn)
            # So sánh không phân biệt hoa thường và tìm kiếm gần đúng
            if search_name.lower() in db_name.lower() or db_name.lower() in search_name.lower():
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
