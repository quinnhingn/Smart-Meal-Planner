import os
import uuid
import requests
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from model.recipes.recipe_model import AIScanLogModel
from repository.recipes.recipe_repository import RecipeRepository

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Cấu hình Cloudinary (Dùng biến môi trường)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://192.168.1.84:8001")

@ai_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_and_log():
    lookup = None # Khai báo ngoài để dùng chung
    try:
        user_id = get_jwt_identity()
        mode = request.form.get('mode', 'diary')
        
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "Không tìm thấy file ảnh"}), 400
            
        file = request.files['image']
        
        # 1. Upload lên Cloudinary
        print("📤 [AI Flow] Đang upload ảnh lên Cloudinary...")
        upload_result = cloudinary.uploader.upload(file, folder="ai_scans")
        image_url = upload_result.get("secure_url")
        
        # 2. Gửi sang AI Server
        file.seek(0)
        print(f"📡 [AI Flow] Đang gửi ảnh sang AI Server...")
        ai_response = requests.post(
            f"{AI_SERVER_URL}/predict",
            files={'image': (file.filename, file.stream, file.mimetype)},
            timeout=20
        )
        ai_data = ai_response.json()
        
        if not ai_data.get('success'):
            return jsonify({"success": False, "message": "AI Server không nhận diện được"}), 500
            
        predictions = ai_data.get('predictions', [])
        if not predictions:
            return jsonify({"success": False, "message": "AI không tìm thấy món ăn nào"}), 404
            
        top_pred = predictions[0]
        
        # 3. Tra cứu dinh dưỡng
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
        scan_log.id = str(uuid.uuid4())
        scan_log.user_id = user_id
        scan_log.scan_type = 'cooked_meal' if mode == 'diary' else 'ingredient'
        scan_log.image_url = image_url
        scan_log.ai_result = ai_data
        scan_log.confirmed_dish_id = confirmed_dish_id
        scan_log.was_corrected = False
        
        db.session.add(scan_log)
        db.session.commit()
        print("✅ [AI Flow] Đã lưu Log thành công!")
        
        # 5. Trả về kết quả
        return jsonify({
            "success": True,
            "data": {
                "label": lookup['name'] if (mode == 'diary' and lookup) else top_pred['label'],
                "confidence": round(top_pred['confidence'] * 100),
                "nutrition": nutrition_info,
                "recipe_id": confirmed_dish_id, # Trả thêm ID để lưu nhật ký
                "image_url": image_url,
                "log_id": scan_log.id,
                "predictions": predictions
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc() # In chi tiết lỗi ra Terminal
        print(f"❌ [AI Flow] Lỗi: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi xử lý AI: {str(e)}"}), 500
