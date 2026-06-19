import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def mark_day1_completed():
    with app.app_context():
        # Lấy lộ trình đầu tiên
        plan = WorkoutPlanModel.query.first()
        if not plan:
            print("Không tìm thấy lộ trình nào trong DB.")
            return
        
        # Lấy ngày 1
        day1 = DailyWorkoutModel.query.filter_by(plan_id=plan.id, day_number=1).first()
        if day1:
            day1.is_completed = True
            day1.completed_at = datetime.utcnow()
            print("Đã mark ngày 1 là completed.")
            
        # Mở khoá ngày 2
        day2 = DailyWorkoutModel.query.filter_by(plan_id=plan.id, day_number=2).first()
        if day2:
            day2.is_unlocked = True
            print("Đã mở khoá ngày 2.")
            
        db.session.commit()
        print("✅ Đã cập nhật thành công DB!")

if __name__ == '__main__':
    mark_day1_completed()
