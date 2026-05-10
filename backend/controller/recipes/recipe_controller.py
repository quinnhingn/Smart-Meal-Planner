from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repository.recipes.recipe_repository import RecipeRepository
from repository.recipes.favorite_repository import FavoriteRepository
from repository.recipes.review_repository import ReviewRepository
from model.recipes.recipe_model import MealLogModel, UserPantryModel
from database.db import db
from datetime import datetime, timedelta
import uuid

recipe_bp = Blueprint('recipes', __name__, url_prefix='/api/recipes')

@recipe_bp.route('/lookup', methods=['GET'])
@jwt_required()
def lookup_recipe():
    name = request.args.get('name')
    if not name:
        return jsonify({"success": False, "message": "Thiếu tham số name"}), 400
        
    result = RecipeRepository.find_by_name_with_nutrition(name)
    if result:
        return jsonify({"success": True, "data": result}), 200
    else:
        return jsonify({"success": False, "message": "Không tìm thấy món ăn"}), 404

@recipe_bp.route('/log', methods=['POST'])
@jwt_required()
def add_meal_log():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Tạo bản ghi nhật ký mới (Dùng cách gán trực tiếp để hết gạch đỏ)
        new_log = MealLogModel()
        new_log.id = uuid.uuid4() # Không dùng str() ở đây
        new_log.user_id = user_id
        new_log.recipe_id = data.get('recipe_id')
        new_log.meal_name = data.get('meal_name')
        new_log.meal_type = data.get('meal_type', 'breakfast')
        new_log.servings = float(data.get('servings', 1.0))
        new_log.calories_consumed = float(data.get('calories', 0))
        new_log.protein_g = float(data.get('protein', 0))
        new_log.fat_g = float(data.get('fat', 0))
        new_log.carbs_g = float(data.get('carbs', 0))
        new_log.eaten_at = db.func.current_timestamp()
        
        db.session.add(new_log)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "Đã lưu nhật ký thành công",
            "log_id": new_log.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ [Log Meal] Lỗi: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi lưu nhật ký: {str(e)}"}), 500

@recipe_bp.route('/daily-summary', methods=['GET'])
@jwt_required()
def get_daily_summary():
    try:
        user_id = get_jwt_identity()
        summary = RecipeRepository.get_daily_summary(user_id)
        
        return jsonify({
            "success": True,
            "data": summary
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi lấy thống kê: {str(e)}"}), 500

@recipe_bp.route('/pantry/import', methods=['POST'])
@jwt_required()
def add_pantry_items():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        items = data.get('items', [])
        
        for item in items:
            expiry_days = int(item.get('expiryDays', 3))
            expiry_date = datetime.now() + timedelta(days=expiry_days)
            
            # Tạo bản ghi tủ lạnh (Để UUID nguyên bản, không ép kiểu String)
            pantry_item = UserPantryModel()
            pantry_item.id = uuid.uuid4() # Không dùng str() ở đây
            pantry_item.user_id = user_id
            pantry_item.ingredient_name = item.get('name')
            pantry_item.quantity = float(item.get('quantity', 1.0))
            pantry_item.unit = item.get('unit', 'g')
            pantry_item.storage_location = item.get('storage', 'fridge')
            pantry_item.expiry_date = expiry_date.date()
            pantry_item.source = 'ai_scan'
            
            db.session.add(pantry_item)
            
        db.session.commit()
        return jsonify({"success": True, "message": f"Đã nhập {len(items)} món vào tủ lạnh"}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ [Pantry Import] Lỗi: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi nhập tủ lạnh: {str(e)}"}), 500

@recipe_bp.route('/pantry', methods=['GET'])
@jwt_required()
def get_pantry_items():
    try:
        user_id = get_jwt_identity()
        # Lấy tất cả món trong tủ lạnh của user, sắp xếp theo ngày nhập mới nhất
        items = UserPantryModel.query.filter_by(user_id=user_id).order_by(UserPantryModel.added_at.desc()).all()
        
        return jsonify({
            "success": True,
            "data": [item.to_dict() for item in items]
        }), 200
        
    except Exception as e:
        print(f"❌ [Get Pantry] Lỗi: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi lấy dữ liệu tủ lạnh: {str(e)}"}), 500

@recipe_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_recipe_suggestions():
    try:
        user_id = get_jwt_identity()
        suggestions = RecipeRepository.get_pantry_suggestions(user_id)
        
        return jsonify({
            "success": True,
            "data": suggestions
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi lấy gợi ý món ăn: {str(e)}"}), 500

@recipe_bp.route('', methods=['GET'])
@jwt_required()
def get_all_recipes():
    try:
        recipes = RecipeRepository.get_all_recipes()
        return jsonify({
            "success": True,
            "data": recipes
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi lấy danh sách món ăn: {str(e)}"}), 500
@recipe_bp.route('/favorites/toggle', methods=['POST'])
@jwt_required()
def toggle_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe_id = data.get('recipeId')
    
    if not recipe_id:
        return jsonify({"success": False, "message": "Thiếu recipeId"}), 400
        
    result = FavoriteRepository.toggle_favorite(user_id, recipe_id)
    return jsonify(result), 200

@recipe_bp.route('/favorites/ids', methods=['GET'])
@jwt_required()
def get_favorite_ids():
    user_id = get_jwt_identity()
    fav_ids = FavoriteRepository.get_user_favorite_ids(user_id)
    return jsonify({"success": True, "data": fav_ids}), 200

@recipe_bp.route('/reviews', methods=['POST'])
@jwt_required()
def add_review():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe_id = data.get('recipeId')
    rating = data.get('rating')
    comment = data.get('text')
    tags = data.get('tags', [])
    images = data.get('images', [])
    
    if not recipe_id or not rating:
        return jsonify({"success": False, "message": "Thiếu thông tin đánh giá"}), 400
        
    result = ReviewRepository.add_review(user_id, recipe_id, rating, comment, tags, images)
    return jsonify(result), 200

@recipe_bp.route('/<recipe_id>/reviews', methods=['GET'])
def get_recipe_reviews(recipe_id):
    # Thử chuyển sang int nếu có thể, nếu không để nguyên string (cho mock data)
    try:
        rid = int(recipe_id)
    except:
        rid = recipe_id
        
    reviews = ReviewRepository.get_reviews_for_recipe(rid)
    stats = ReviewRepository.get_recipe_stats(rid)
    return jsonify({
        "success": True, 
        "data": reviews,
        "stats": stats
    }), 200

@recipe_bp.route('/log-recipe', methods=['POST'])
@jwt_required()
def log_recipe_meal():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        recipe_id = data.get('recipeId')
        servings = data.get('servings', 1)
        
        if not recipe_id:
            return jsonify({"success": False, "message": "Thiếu recipeId"}), 400
            
        result = RecipeRepository.log_meal_and_deduct(user_id, recipe_id, servings)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@recipe_bp.route('/pantry/history', methods=['GET'])
@jwt_required()
def get_pantry_history():
    user_id = get_jwt_identity()
    result = RecipeRepository.get_pantry_history(user_id)
    return jsonify({"success": True, "data": result}), 200

# ==========================================
# SHOPPING LIST ENDPOINTS
# ==========================================

@recipe_bp.route('/shopping-list', methods=['GET'])
@jwt_required()
def get_shopping_list():
    user_id = get_jwt_identity()
    result = RecipeRepository.get_shopping_list(user_id)
    return jsonify({"success": True, "data": result}), 200

@recipe_bp.route('/shopping-list/add', methods=['POST'])
@jwt_required()
def add_to_shopping_list():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe_id = data.get('recipeId')
    servings = data.get('servings', 1)
    
    if not recipe_id:
        return jsonify({"success": False, "message": "Thiếu recipeId"}), 400
        
    result = RecipeRepository.add_to_shopping_list(user_id, recipe_id, servings)
    return jsonify(result), 200

@recipe_bp.route('/shopping-list/<item_id>', methods=['PUT'])
@jwt_required()
def update_shopping_item(item_id):
    data = request.get_json()
    success = RecipeRepository.update_shopping_item(item_id, data)
    return jsonify({"success": success}), 200 if success else 400

@recipe_bp.route('/shopping-list/save', methods=['POST'])
@jwt_required()
def save_shopping_to_pantry():
    user_id = get_jwt_identity()
    result = RecipeRepository.save_shopping_to_pantry(user_id)
    return jsonify(result), 200

@recipe_bp.route('/shopping-list', methods=['DELETE'])
@jwt_required()
def clear_shopping_list():
    user_id = get_jwt_identity()
    success = RecipeRepository.clear_shopping_list(user_id)
    return jsonify({"success": success}), 200 if success else 400

@recipe_bp.route('/shopping-list/manual', methods=['POST'])
@jwt_required()
def add_manual_shopping_item():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    quantity = data.get('quantity', 1)
    unit = data.get('unit', 'g')
    
    if not name:
        return jsonify({"success": False, "message": "Thiếu tên nguyên liệu"}), 400
        
    result = RecipeRepository.add_custom_item_to_shopping_list(user_id, name, quantity, unit)
    return jsonify(result), 200

@recipe_bp.route('/shopping-list/toggle-all', methods=['PUT'])
@jwt_required()
def toggle_all_shopping_items():
    user_id = get_jwt_identity()
    data = request.get_json()
    is_bought = data.get('isBought', True)
    success = RecipeRepository.toggle_all_shopping_items(user_id, is_bought)
    return jsonify({"success": success}), 200 if success else 400
@recipe_bp.route('/diary', methods=['GET'])
@jwt_required()
def get_meal_history():
    user_id = get_jwt_identity()
    logs = RecipeRepository.get_meal_history(user_id)
    return jsonify({"success": True, "data": logs}), 200

@recipe_bp.route('/diary/<log_id>', methods=['DELETE'])
@jwt_required()
def delete_meal_log(log_id):
    user_id = get_jwt_identity()
    result = RecipeRepository.delete_meal_log(user_id, log_id)
    return jsonify(result), 200

@recipe_bp.route('/diary/<log_id>', methods=['PUT'])
@jwt_required()
def update_meal_log(log_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    result = RecipeRepository.update_meal_log(user_id, log_id, data)
    return jsonify(result), 200
