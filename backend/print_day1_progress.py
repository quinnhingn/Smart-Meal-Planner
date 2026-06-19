import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def print_day1_progress():
    with app.app_context():
        plan = WorkoutPlanModel.query.first()
        if not plan:
            print("Không có plan")
            return
        
        day1 = DailyWorkoutModel.query.filter_by(plan_id=plan.id, day_number=1).first()
        if day1:
            print("Day 1 progress_data:", day1.progress_data)
        else:
            print("Không tìm thấy Day 1.")

if __name__ == '__main__':
    print_day1_progress()
