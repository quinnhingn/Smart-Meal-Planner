from repository.ingredients.ingredient_repository import IngredientRepository
from validation.ingredients.ingredient_validation import IngredientRequest

class IngredientHandler:
    def __init__(self):
        self.repo = IngredientRepository()

    def get_all_ingredients(self):
        ingredients = self.repo.get_all()
        return {
            "success": True,
            "data": [ing.to_dict() for ing in ingredients],
            "status_code": 200
        }

    def get_ingredient(self, ingredient_id: int):
        ingredient = self.repo.get_by_id(ingredient_id)
        if not ingredient:
            return {"success": False, "message": "Không tìm thấy nguyên liệu", "status_code": 404}
        return {"success": True, "data": ingredient.to_dict(), "status_code": 200}

    def create_ingredient(self, data: IngredientRequest, admin_id: str):
        ingredient_data = data.model_dump()
        ingredient_data['created_by'] = admin_id
        
        new_ing = self.repo.create(ingredient_data)
        return {
            "success": True, 
            "message": "Thêm nguyên liệu thành công",
            "data": new_ing.to_dict(),
            "status_code": 201
        }

    def update_ingredient(self, ingredient_id: int, data: IngredientRequest):
        updated_ing = self.repo.update(ingredient_id, data.model_dump())
        if not updated_ing:
            return {"success": False, "message": "Không tìm thấy nguyên liệu", "status_code": 404}
            
        return {
            "success": True, 
            "message": "Cập nhật nguyên liệu thành công",
            "data": updated_ing.to_dict(),
            "status_code": 200
        }

    def delete_ingredient(self, ingredient_id: int):
        success = self.repo.delete(ingredient_id)
        if not success:
            return {"success": False, "message": "Không tìm thấy nguyên liệu", "status_code": 404}
            
        return {"success": True, "message": "Xóa nguyên liệu thành công", "status_code": 200}
