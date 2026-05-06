from model.auth.user_model import UserModel
from database.db import db

class AuthRepository:
    def get_user_by_email(self, email: str) -> UserModel:
        """Tìm user theo email"""
        return UserModel.query.filter_by(email=email).first()

    def create_user(self, name: str, email: str, password_hash: str) -> UserModel:
        """Tạo user mới với role mặc định là 'user'"""
        new_user = UserModel(
            name=name,
            email=email,
            password_hash=password_hash,
            role='user'  # Luôn set role là 'user' cho client
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user
