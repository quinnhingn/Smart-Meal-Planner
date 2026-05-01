import os
import sys
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database.db import db
from controller.auth.auth_controller import auth_bp
from dotenv import load_dotenv

# Đọc cấu hình từ file .env
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

app = Flask(__name__)
# Cho phép Frontend gọi API mà không bị chặn CORS
CORS(app)

# Cấu hình kết nối tới Neon Database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Cấu hình JWT (Token bảo mật)
app.config['JWT_SECRET_KEY'] = 'SmartMeal_Super_Secret_Key_2026'
jwt = JWTManager(app)

# Khởi tạo Database
db.init_app(app)

# Đăng ký Blueprint của Auth
app.register_blueprint(auth_bp)

@app.route('/')
def health_check():
    return {"status": "ok", "message": "Smart Meal Planner API is running!"}

if __name__ == '__main__':
    print("🚀 Khởi động Server Backend trên cổng 5000...")
    app.run(debug=True, port=5000)
