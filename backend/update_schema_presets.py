import os
import sys

# Thêm đường dẫn backend vào sys.path để import dễ dàng
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.preset_program_model import PresetProgramModel

def create_preset_tables():
    with app.app_context():
        print("🛠 Đang tạo bảng preset_programs...")
        db.create_all()
        print("✅ Bảng đã được tạo thành công (nếu chưa tồn tại)!")

if __name__ == '__main__':
    create_preset_tables()
