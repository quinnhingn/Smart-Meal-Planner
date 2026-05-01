from flask import Blueprint, request, jsonify
from handler.auth.auth_handler import AuthHandler
from validation.auth.auth_validation import LoginRequest
from pydantic import ValidationError

# Tạo Blueprint cho Auth
auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')
auth_handler = AuthHandler()

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    try:
        # 1. Lấy dữ liệu từ Request Body
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Vui lòng cung cấp dữ liệu JSON"}), 400
            
        # 2. Validate dữ liệu bằng Pydantic
        validated_data = LoginRequest(**data)
        
        # 3. Gọi Handler xử lý nghiệp vụ
        result = auth_handler.login_admin(validated_data)
        
        # 4. Trả về Response
        return jsonify(result), result.get("status_code", 200)

    except ValidationError as e:
        # Lỗi Validate dữ liệu (Ví dụ: Thiếu email, password quá ngắn)
        return jsonify({
            "success": False,
            "message": "Dữ liệu đầu vào không hợp lệ",
            "errors": e.errors()
        }), 400
    except Exception as e:
        # Lỗi hệ thống
        return jsonify({
            "success": False,
            "message": f"Lỗi máy chủ: {str(e)}"
        }), 500
