from flask import Blueprint, request, jsonify
from handler.auth.auth_handler import AuthHandler
from validation.auth.auth_validation import RegisterRequest, LoginRequest
from pydantic import ValidationError

# Blueprint cho Auth của Client
auth_bp = Blueprint('client_auth_bp', __name__, url_prefix='/api/auth')
auth_handler = AuthHandler()

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    POST /api/auth/register
    Body: { "name": "...", "email": "...", "password": "..." }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Vui lòng cung cấp dữ liệu JSON"}), 400

        validated_data = RegisterRequest(**data)
        result = auth_handler.register(validated_data)
        return jsonify(result), result.get("status_code", 201)

    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Dữ liệu đầu vào không hợp lệ",
            "errors": e.errors()
        }), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi máy chủ: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Body: { "email": "...", "password": "..." }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Vui lòng cung cấp dữ liệu JSON"}), 400

        validated_data = LoginRequest(**data)
        result = auth_handler.login(validated_data)
        return jsonify(result), result.get("status_code", 200)

    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Dữ liệu đầu vào không hợp lệ",
            "errors": e.errors()
        }), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Lỗi máy chủ: {str(e)}"}), 500
