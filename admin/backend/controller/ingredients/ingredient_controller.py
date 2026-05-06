from flask import Blueprint, request, jsonify
from handler.ingredients.ingredient_handler import IngredientHandler
from validation.ingredients.ingredient_validation import IngredientRequest
import cloudinary
import cloudinary.uploader
import os

# Cấu hình Cloudinary từ biến môi trường
cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)
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
            "sugar": 0, "fiber": 0, "saturatedFat": 0, "cholesterol": 0,
            "sodium": 0, "potassium": 0, "calcium": 0, "iron": 0,
            "vitaminC": 0, "vitaminA": 0, "vitaminD": 0
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
            elif 'cholesterol' in name:
                nutrition_data['cholesterol'] = val
            elif 'sodium, na' in name:
                nutrition_data['sodium'] = val
            elif 'potassium, k' in name:
                nutrition_data['potassium'] = val
            elif 'calcium, ca' in name:
                nutrition_data['calcium'] = val
            elif 'iron, fe' in name:
                nutrition_data['iron'] = val
            elif 'vitamin c' in name:
                nutrition_data['vitaminC'] = val
            elif 'vitamin a' in name:
                nutrition_data['vitaminA'] = val
            elif 'vitamin d' in name:
                nutrition_data['vitaminD'] = val
                
        return jsonify({
            "success": True, 
            "data": nutrition_data,
            "source": food.get('description', '')
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi gọi API USDA: {str(e)}"}), 500

@ingredient_bp.route('/guidelines', methods=['POST'])
@jwt_required()
def get_guidelines():
    try:
        data = request.get_json()
        query = data.get('query', '').strip().lower()
        if not query:
            return jsonify({"success": False, "message": "Thiếu từ khóa tìm kiếm"}), 400

        import os, json
        # File is at admin/backend/data/integrident.json
        # __file__ is admin/backend/controller/ingredients/ingredient_controller.py
        # so data dir is at ../../data/integrident.json
        json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/integrident.json'))
        
        if not os.path.exists(json_path):
            return jsonify({"success": False, "message": f"Không tìm thấy file dữ liệu ở: {json_path}"}), 404
            
        with open(json_path, 'r', encoding='utf-8') as f:
            guidelines = json.load(f)
            
        for item in guidelines:
            if item.get('Tên Nguyên Liệu', '').strip().lower() == query:
                return jsonify({
                    "success": True,
                    "data": {
                        "storage": item.get('Cách Bảo Quản', ''),
                        "min_weight": item.get('Cân Nặng Min (kg)', ''),
                        "max_weight": item.get('Cân Nặng Max (kg)', ''),
                        "notes": item.get('Ghi Chú Thêm', '')
                    }
                }), 200
                
        return jsonify({"success": False, "message": "Không tìm thấy hướng dẫn cho nguyên liệu này trong hệ thống."}), 404
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi server: {str(e)}"}), 500

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

@ingredient_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "Không tìm thấy file ảnh"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "message": "Tên file trống"}), 400
            
        if file:
            # Tải ảnh lên Cloudinary
            upload_result = cloudinary.uploader.upload(file, folder="ingredients")
            
            return jsonify({
                "success": True, 
                "image_url": upload_result.get("secure_url")
            }), 200
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi upload: {str(e)}"}), 500

@ingredient_bp.route('/remove-bg', methods=['POST'])
@jwt_required()
def remove_background():
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({"success": False, "message": "Thiếu URL ảnh"}), 400

        # 1. Tải ảnh về từ URL hoặc đọc từ Local
        import requests
        from io import BytesIO
        from rembg import remove
        from PIL import Image
        import uuid
        import os

        input_image = None
        
        # 1. Nếu là mã ảnh Base64 (data:image/...)
        if image_url.startswith("data:image"):
            import base64
            header, encoded = image_url.split(",", 1)
            image_data = base64.b64decode(encoded)
            input_image = Image.open(BytesIO(image_data))
        
        # 2. Nếu là ảnh local của mình (localhost:5000/uploads/...)
        elif "localhost:5000/uploads/" in image_url:
            filename = image_url.split("/")[-1]
            upload_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uploads'))
            local_path = os.path.join(upload_path, filename)
            if os.path.exists(local_path):
                input_image = Image.open(local_path)
        
        # 3. Nếu là link từ ngoài internet
        if not input_image:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
            try:
                response = requests.get(image_url, headers=headers, timeout=15, verify=False) # verify=False để bỏ qua lỗi SSL nếu có
                if response.status_code == 200:
                    input_image = Image.open(BytesIO(response.content))
                else:
                    return jsonify({"success": False, "message": f"Website chặn tải ảnh (Mã lỗi: {response.status_code}). Ngân hãy thử tải ảnh về máy rồi upload lên nhé!"}), 400
            except Exception as e:
                 return jsonify({"success": False, "message": f"Không thể kết nối tới nguồn ảnh: {str(e)}"}), 400

        if not input_image:
            return jsonify({"success": False, "message": "Không thể định dạng được hình ảnh này."}), 400

        # Chuyển đổi sang RGB nếu cần (tránh lỗi với một số định dạng lạ)
        if input_image.mode != 'RGB' and input_image.mode != 'RGBA':
            input_image = input_image.convert('RGB')

        # 2. Xử lý tách nền bằng AI
        output_image = remove(input_image)

        # 3. Lưu tạm ảnh đã tách nền và đẩy lên Cloudinary
        img_byte_arr = BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        # Tải lên Cloudinary
        upload_result = cloudinary.uploader.upload(
            img_byte_arr, 
            folder="ingredients_nobg",
            public_id=f"nobg_{uuid.uuid4()}"
        )

        return jsonify({
            "success": True,
            "image_url": upload_result.get("secure_url")
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi tách nền: {str(e)}"}), 500

@ingredient_bp.route('/auto-load-conversions', methods=['POST'])
@jwt_required()
def auto_load_conversions():
    try:
        data = request.get_json()
        query = data.get('query', '').strip().lower()
        if not query:
            return jsonify({"success": False, "message": "Thiếu từ khóa tìm kiếm"}), 400

        import os, json
        # Lưu ý: Tên file có khoảng trắng ở giữa như Ngân đặt
        json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/material- conversion.json'))
        
        if not os.path.exists(json_path):
            return jsonify({"success": False, "message": "Không tìm thấy file dữ liệu quy đổi."}), 404
            
        with open(json_path, 'r', encoding='utf-8') as f:
            data_list = json.load(f)
            
        matches = []
        for item in data_list:
            if item.get('Tên Nguyên Liệu / Phân loại', '').strip().lower() == query:
                matches.append({
                    "from": item.get('Đơn vị thường gọi', ''),
                    "to": f"{item.get('Quy đổi ra Gram (g) trung bình', '')}g",
                    "note": item.get('Ghi chú', '')
                })
        
        if not matches:
             return jsonify({"success": False, "message": f"Không tìm thấy dữ liệu quy đổi cho '{query}'"}), 404
             
        return jsonify({"success": True, "data": matches}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi server: {str(e)}"}), 500

@ingredient_bp.route('/auto-load-substitutions', methods=['POST'])
@jwt_required()
def auto_load_substitutions():
    try:
        data = request.get_json()
        query = data.get('query', '').strip().lower()
        if not query:
            return jsonify({"success": False, "message": "Thiếu từ khóa tìm kiếm"}), 400

        import os, json
        # Lưu ý: Tên file có khoảng trắng ở giữa như Ngân đặt
        json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/alternative- materials.json'))
        
        if not os.path.exists(json_path):
            return jsonify({"success": False, "message": "Không tìm thấy file dữ liệu thay thế."}), 404
            
        with open(json_path, 'r', encoding='utf-8') as f:
            data_list = json.load(f)
            
        matches = []
        for item in data_list:
            if item.get('Nguyên Liệu Gốc', '').strip().lower() == query:
                matches.append({
                    "name": item.get('Nguyên Liệu Thay Thế', '')
                })
        
        if not matches:
             return jsonify({"success": False, "message": f"Không tìm thấy nguyên liệu thay thế cho '{query}'"}), 404
             
        return jsonify({"success": True, "data": matches}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi server: {str(e)}"}), 500
