from model.auth.user_model import UserModel

class AuthRepository:
    def get_user_by_email(self, email: str) -> UserModel:
        """Truy vấn tìm user dựa trên email"""
        return UserModel.query.filter_by(email=email).first()
