from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from handler.recipes.recipe_handler import RecipeHandler
from functools import wraps

recipe_bp = Blueprint('recipe_bp', __name__, url_prefix='/api/recipes')
recipe_handler = RecipeHandler()

# Decorator check quyền Admin
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify({"success": False, "message": "Chỉ Admin mới có quyền thực hiện thao tác này"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@recipe_bp.route('', methods=['POST'])
@admin_required()
def create_recipe():
    """
    API tạo mới công thức nấu ăn
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Dữ liệu không được trống"}), 400
            
        admin_id = get_jwt_identity()
        result = recipe_handler.create_recipe(data, admin_id)
        
        status_code = 201 if result.get("success") else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi Controller: {str(e)}"}), 500

@recipe_bp.route('', methods=['GET'])
@jwt_required()
def get_all_recipes():
    """
    API lấy danh sách công thức
    """
    try:
        result = recipe_handler.get_all_recipes()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@recipe_bp.route('/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe_detail(recipe_id):
    """
    API lấy chi tiết một công thức
    """
    try:
        result = recipe_handler.get_recipe_by_id(recipe_id)
        if result["success"]:
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@recipe_bp.route('/<int:recipe_id>', methods=['PUT'])
@admin_required()
def update_recipe(recipe_id):
    """
    API cập nhật công thức
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Dữ liệu không được trống"}), 400
            
        result = recipe_handler.update_recipe(recipe_id, data)
        status_code = 200 if result.get("success") else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi Controller: {str(e)}"}), 500
