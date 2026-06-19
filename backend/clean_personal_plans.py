import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def clean_personal_plans():
    with app.app_context():
        print("Đang xóa tất cả các lộ trình cá nhân...")
        # Xoá DailyWorkout trước do có khoá ngoại (mặc dù SQLAlchemy cascade có thể lo được)
        db.session.query(DailyWorkoutModel).delete()
        db.session.query(WorkoutPlanModel).delete()
        db.session.commit()
        print("✅ Đã xóa sạch dữ liệu lộ trình cá nhân cũ!")

if __name__ == '__main__':
    clean_personal_plans()
