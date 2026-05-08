from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repository.recipes.recipe_repository import RecipeRepository
from model.recipes.recipe_model import MealLogModel
from database.db import db
import uuid

recipe_bp = Blueprint('recipes', __name__, url_prefix='/api/recipes')

@recipe_bp.route('/lookup', methods=['GET'])
def lookup_recipe():
    name = request.args.get('name')
    if not name:
        return jsonify({"success": False, "message": "Thiếu tên món ăn để tìm kiếm"}), 400
        
    result = RecipeRepository.find_by_name_with_nutrition(name)
    
    if not result:
        return jsonify({
            "success": False, 
            "message": f"Không tìm thấy thông tin dinh dưỡng cho món '{name}'"
        }), 404
        
    return jsonify({
        "success": True,
        "data": result
    }), 200

@recipe_bp.route('/log', methods=['POST'])
@jwt_required()
def add_meal_log():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Tạo bản ghi nhật ký mới
        new_log = MealLogModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            recipe_id=data.get('recipe_id'), # Có thể null
            meal_name=data.get('meal_name'),
            meal_type=data.get('meal_type', 'breakfast'),
            servings=data.get('servings', 1.0),
            calories_consumed=data.get('calories'),
            protein_g=data.get('protein'),
            fat_g=data.get('fat'),
            carbs_g=data.get('carbs')
        )
        
        db.session.add(new_log)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Đã thêm vào nhật ký thành công!",
            "log_id": new_log.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Lỗi lưu nhật ký: {str(e)}"}), 500
