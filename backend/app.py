import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database.db import db
from controller.auth.auth_controller import auth_bp
from controller.auth.user_profile_controller import profile_bp

app = Flask(__name__)
CORS(app)

# Cấu hình Database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

# Cấu hình JWT
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "SmartMeal_Client_Secret_Key_2026")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# Khởi tạo DB
db.init_app(app)

# Đăng ký Blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

@app.route('/')
def health_check():
    return {"status": "ok", "message": "Smart Meal Planner Client API is running!"}

if __name__ == '__main__':
    print("🚀 Khởi động Client Backend trên cổng 5001...")
    app.run(debug=True, host='0.0.0.0', port=5001)
