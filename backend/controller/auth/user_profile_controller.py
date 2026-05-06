from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from handler.auth.user_profile_handler import UserProfileHandler

# Blueprint cho Profile của Client
profile_bp = Blueprint('client_profile_bp', __name__, url_prefix='/api/user/profile')
profile_handler = UserProfileHandler()

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    """Lấy hồ sơ cá nhân của người dùng hiện tại"""
    user_id = get_jwt_identity()
    result = profile_handler.get_user_profile(user_id)
    return jsonify(result), result.get("status_code", 200)

@profile_bp.route('', methods=['POST'])
@jwt_required()
def update_profile():
    """Tạo hoặc cập nhật hồ sơ cá nhân (Onboarding)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "message": "Dữ liệu không hợp lệ"}), 400
        
    result = profile_handler.update_user_profile(user_id, data)
    return jsonify(result), result.get("status_code", 200)
