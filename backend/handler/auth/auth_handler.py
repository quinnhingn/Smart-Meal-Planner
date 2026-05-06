from repository.auth.auth_repository import AuthRepository
from repository.auth.user_profile_repository import UserProfileRepository
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from validation.auth.auth_validation import RegisterRequest, LoginRequest

class AuthHandler:
    def __init__(self):
        self.auth_repo = AuthRepository()
        self.profile_repo = UserProfileRepository()

    def register(self, data: RegisterRequest):
        # 1. Kiểm tra email đã tồn tại chưa
        existing_user = self.auth_repo.get_user_by_email(data.email)
        if existing_user:
            return {"success": False, "message": "Email này đã được đăng ký", "status_code": 409}

        # 2. Hash mật khẩu (không bao giờ lưu plain text)
        hashed_pw = generate_password_hash(data.password)

        # 3. Tạo user mới (role luôn là 'user')
        new_user = self.auth_repo.create_user(
            name=data.name,
            email=data.email,
            password_hash=hashed_pw
        )

        # 4. Tạo JWT Token ngay sau khi đăng ký (đăng nhập luôn)
        access_token = create_access_token(
            identity=str(new_user.id),
            additional_claims={"role": new_user.role}
        )

        return {
            "success": True,
            "message": "Đăng ký thành công!",
            "data": {
                "token": access_token,
                "user": new_user.to_dict()
            },
            "status_code": 201
        }

    def login(self, data: LoginRequest):
        # 1. Tìm user theo email
        user = self.auth_repo.get_user_by_email(data.email)

        # 2. Kiểm tra user tồn tại
        if not user:
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác", "status_code": 401}

        # 3. Kiểm tra mật khẩu
        if not check_password_hash(user.password_hash, data.password):
            return {"success": False, "message": "Email hoặc mật khẩu không chính xác", "status_code": 401}

        # 4. Tạo JWT Token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        # 5. Kiểm tra xem user đã làm Onboarding chưa
        profile = self.profile_repo.get_profile_by_user_id(user.id)

        return {
            "success": True,
            "message": "Đăng nhập thành công!",
            "data": {
                "token": access_token,
                "user": user.to_dict(),
                "has_profile": profile is not None,
                "profile": profile.to_dict() if profile else None
            },
            "status_code": 200
        }
