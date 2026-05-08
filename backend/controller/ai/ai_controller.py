import os
import uuid
import requests
import json
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
from PIL import Image
import io
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from model.recipes.recipe_model import AIScanLogModel
from repository.recipes.recipe_repository import RecipeRepository

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Cấu hình Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://192.168.1.84:8001")

@ai_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_and_log():
    lookup = None
    try:
        user_id = get_jwt_identity()
        mode = request.form.get('mode', 'diary') # 'diary' hoặc 'pantry'
        
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "Không tìm thấy file ảnh"}), 400
            
        file = request.files['image']
        
        # 1. Upload lên Cloudinary
        print(f"📤 [AI Flow] Mode: {mode} - Đang upload ảnh lên Cloudinary...")
        upload_result = cloudinary.uploader.upload(file, folder="ai_scans")
        image_url = upload_result.get("secure_url")
        
        predictions = []
        ai_data_for_log = {}

        # 2. Xử lý nhận diện dựa trên Mode
        if mode == 'pantry':
            # --- LUỒNG GEMINI (Cho Tủ lạnh - Nhiều món) ---
            file.seek(0)
            img = Image.open(io.BytesIO(file.read()))
            
            prompt = """Bạn là trợ lý quản lý tủ lạnh thông minh. 
            Phân tích ảnh và liệt kê các nguyên liệu thực phẩm.
            Với mỗi nguyên liệu, hãy ước tính khối lượng và gợi ý cách bảo quản.
            Trả về JSON format:
            {
              "ingredients": [
                {
                  "name": "tên tiếng Việt",
                  "quantity": con số ước tính,
                  "unit": "g" hoặc "kg" hoặc "con" hoặc "bó" hoặc "trái",
                  "storage": "freezer" hoặc "fridge" hoặc "veggie_drawer",
                  "expiry_days": số ngày bảo quản tối đa gợi ý (số nguyên),
                  "confidence": 0.95
                }
              ]
            }
            Chỉ trả về JSON thuần túy, không thêm văn bản khác."""
            
            response = gemini_model.generate_content([prompt, img])
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            
            try:
                result = json.loads(raw_text)
                # Map dữ liệu sang format chung của predictions
                predictions = result.get("ingredients", [])
                # Giữ nguyên label cho thống nhất logic cũ
                for p in predictions:
                    p['label'] = p['name']
                ai_data_for_log = result
            except:
                print(f"❌ [AI Flow] Gemini trả về format sai: {raw_text}")
                return jsonify({"success": False, "message": "Lỗi định dạng phản hồi từ Gemini"}), 500
        else:
            # --- LUỒNG YOLO (Cho Nhật ký - 1 món ăn) ---
            print(f"📡 [AI Flow] Đang gửi ảnh sang AI Server...")
            file.seek(0)
            ai_response = requests.post(
                f"{AI_SERVER_URL}/predict",
                files={'image': (file.filename, file.stream, file.mimetype)},
                timeout=20
            )
            ai_data = ai_response.json()
            if not ai_data.get('success'):
                return jsonify({"success": False, "message": "AI Server không nhận diện được"}), 500
            
            predictions = ai_data.get('predictions', [])
            ai_data_for_log = ai_data

        if not predictions:
            return jsonify({"success": False, "message": "Không nhận diện được nội dung ảnh"}), 404
            
        top_pred = predictions[0]
        
        # 3. Tra cứu dinh dưỡng (Chỉ cho mode diary)
        nutrition_info = None
        confirmed_dish_id = None
        
        if mode == 'diary':
            lookup = RecipeRepository.find_by_name_with_nutrition(top_pred['label'])
            if lookup:
                nutrition_info = lookup['nutrition']
                confirmed_dish_id = lookup['id']
        
        # 4. Lưu Log vào Database
        print("💾 [AI Flow] Bắt đầu lưu lịch sử vào DB...")
        scan_log = AIScanLogModel()
        scan_log.id = uuid.uuid4() # Bỏ str()
        scan_log.user_id = user_id
        scan_log.scan_type = 'cooked_meal' if mode == 'diary' else 'ingredient'
        scan_log.image_url = image_url
        scan_log.ai_result = ai_data_for_log
        scan_log.confirmed_dish_id = confirmed_dish_id
        scan_log.was_corrected = False
        
        db.session.add(scan_log)
        db.session.commit()
        print(f"✅ [AI Flow] Đã lưu Log thành công! (Mode: {mode})")
        
        # 5. Trả về kết quả
        return jsonify({
            "success": True,
            "data": {
                "label": lookup['name'] if (mode == 'diary' and lookup) else top_pred['label'],
                "confidence": round(top_pred['confidence'] * 100),
                "nutrition": nutrition_info,
                "recipe_id": confirmed_dish_id if mode == 'diary' else None,
                "image_url": image_url,
                "log_id": scan_log.id,
                "predictions": predictions # Trả về toàn bộ danh sách (Gemini có nhiều món)
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        print(f"❌ [AI Flow] Lỗi: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi xử lý AI: {str(e)}"}), 500
