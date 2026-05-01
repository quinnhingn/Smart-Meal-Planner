from flask import Blueprint, request, jsonify
from handler.ingredients.ingredient_handler import IngredientHandler
from validation.ingredients.ingredient_validation import IngredientRequest
from pydantic import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
import urllib.request
import urllib.parse
import json

ingredient_bp = Blueprint('ingredient_bp', __name__, url_prefix='/api/ingredients')
ingredient_handler = IngredientHandler()

# Decorator Custom để check quyền Admin
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

@ingredient_bp.route('', methods=['GET'])
@jwt_required() # User hay Admin đều có thể xem danh sách nguyên liệu
def get_all():
    result = ingredient_handler.get_all_ingredients()
    return jsonify(result), result.get("status_code", 200)

@ingredient_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_one(id):
    result = ingredient_handler.get_ingredient(id)
    return jsonify(result), result.get("status_code", 200)

@ingredient_bp.route('/translate', methods=['POST'])
@jwt_required()
def translate_name():
    try:
        data = request.get_json()
        text_vn = data.get('text', '')
        if not text_vn:
            return jsonify({"success": False, "message": "Vui lòng nhập tên nguyên liệu"}), 400
            
        # Dùng MyMemory API (Miễn phí, không cần key)
        url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text_vn)}&langpair=vi|en"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            translated_text = result.get('responseData', {}).get('translatedText', '')
            
            if translated_text:
                translated_text = translated_text.title()
                
            return jsonify({"success": True, "translated_text": translated_text}), 200
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi dịch thuật: {str(e)}"}), 500

@ingredient_bp.route('/auto-fill', methods=['POST'])
@jwt_required()
def auto_fill_nutrition():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"success": False, "message": "Thiếu từ khóa tiếng Anh để tìm kiếm"}), 400

        # Dùng USDA API với DEMO_KEY
        import os
        api_key = os.environ.get('USDA_API_KEY', 'DEMO_KEY')
        url = f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={urllib.parse.quote(query)}&pageSize=1"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            
        if not result.get('foods') or len(result['foods']) == 0:
            return jsonify({"success": False, "message": "Không tìm thấy dữ liệu trong CSDL USDA"}), 404
            
        food = result['foods'][0]
        nutrients = food.get('foodNutrients', [])
        
        # Mặc định kết quả USDA là trên 100g
        nutrition_data = {
            "calories": 0, "protein": 0, "carbs": 0, "fat": 0,
            "sugar": 0, "fiber": 0, "saturatedFat": 0, "sodium": 0,
            "calcium": 0, "iron": 0, "vitaminC": 0, "vitaminA": 0
        }
        
        for nut in nutrients:
            name = nut.get('nutrientName', '').lower()
            val = nut.get('value', 0)
            
            if 'energy' in name and nut.get('unitName') == 'KCAL':
                nutrition_data['calories'] = val
            elif 'protein' in name:
                nutrition_data['protein'] = val
            elif 'carbohydrate, by difference' in name:
                nutrition_data['carbs'] = val
            elif 'total lipid (fat)' in name:
                nutrition_data['fat'] = val
            elif 'sugars, total' in name:
                nutrition_data['sugar'] = val
            elif 'fiber, total dietary' in name:
                nutrition_data['fiber'] = val
            elif 'fatty acids, total saturated' in name:
                nutrition_data['saturatedFat'] = val
            elif 'sodium, na' in name:
                nutrition_data['sodium'] = val
            elif 'calcium, ca' in name:
                nutrition_data['calcium'] = val
            elif 'iron, fe' in name:
                nutrition_data['iron'] = val
            elif 'vitamin c' in name:
                nutrition_data['vitaminC'] = val
            elif 'vitamin a' in name:
                nutrition_data['vitaminA'] = val
                
        return jsonify({
            "success": True, 
            "data": nutrition_data,
            "source": food.get('description', '')
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi gọi API USDA: {str(e)}"}), 500

@ingredient_bp.route('', methods=['POST'])
@admin_required() # Bắt buộc là Admin
def create():
    try:
        data = request.get_json()
        validated_data = IngredientRequest(**data)
        admin_id = get_jwt_identity() # Lấy ID của admin từ Token
        
        result = ingredient_handler.create_ingredient(validated_data, admin_id)
        return jsonify(result), result.get("status_code", 201)

    except ValidationError as e:
        return jsonify({"success": False, "message": "Dữ liệu không hợp lệ", "errors": e.errors()}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi máy chủ: {str(e)}"}), 500

@ingredient_bp.route('/<int:id>', methods=['PUT'])
@admin_required()
def update(id):
    try:
        data = request.get_json()
        validated_data = IngredientRequest(**data)
        
        result = ingredient_handler.update_ingredient(id, validated_data)
        return jsonify(result), result.get("status_code", 200)

    except ValidationError as e:
        return jsonify({"success": False, "message": "Dữ liệu không hợp lệ", "errors": e.errors()}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi máy chủ: {str(e)}"}), 500

@ingredient_bp.route('/<int:id>', methods=['DELETE'])
@admin_required()
def delete(id):
    try:
        result = ingredient_handler.delete_ingredient(id)
        return jsonify(result), result.get("status_code", 200)
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi máy chủ: {str(e)}"}), 500
