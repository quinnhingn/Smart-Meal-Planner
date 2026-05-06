import os
import sys

# Thêm đường dẫn gốc vào sys.path để import được các module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from backend.database.db import db
from dotenv import load_dotenv

# Import các model để SQLAlchemy nhận diện
from backend.model.auth.user_model import UserModel
from backend.model.ingredients.ingredient_model import IngredientModel

def init_db():
    # Load env
    load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        print("⚠️  Đang chuẩn bị làm mới bảng dữ liệu...")
        
        # Chỉ xoá và tạo lại bảng nguyên liệu để tránh mất dữ liệu User
        # Nếu muốn xoá hết sạch sành sanh thì dùng db.drop_all()
        # CHỈ TẠO BẢNG MỚI, KHÔNG BAO GIỜ XOÁ DỮ LIỆU CŨ
        try:
            print("🏗️  Đang kiểm tra và tạo các bảng mới (nếu chưa có)...")
            db.create_all()
            print("✅ Hoàn tất! Database đã sẵn sàng.")
        except Exception as e:
            print(f"❌ Có lỗi xảy ra: {str(e)}")

if __name__ == '__main__':
    init_db()
