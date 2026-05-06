from repository.auth.auth_repository import AuthRepository
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from validation.auth.auth_validation import LoginRequest

class AuthHandler:
    def __init__(self):
        self.auth_repo = AuthRepository()

    def login_admin(self, data: LoginRequest):
        # 1. Lấy thông tin user từ DB thông qua Repo
        user = self.auth_repo.get_user_by_email(data.email)
        
        # 2. Kiểm tra tồn tại
        if not user:
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác", "status_code": 401}

        # 3. Kiểm tra quyền Admin
        if user.role != 'admin':
            return {"success": False, "message": "Bạn không có quyền truy cập trang quản trị", "status_code": 403}

        # 4. Kiểm tra mật khẩu (so khớp hash)
        if not check_password_hash(user.password_hash, data.password):
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác", "status_code": 401}

        # 5. Tạo JWT Token (có gắn thêm quyền role vào payload)
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        
        return {
            "success": True, 
            "message": "Đăng nhập thành công",
            "data": {
                "token": access_token,
                "user": user.to_dict()
            },
            "status_code": 200
        }
