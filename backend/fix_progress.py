import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def fix_progress():
    with app.app_context():
        # Lấy lộ trình Yoga
        plan = WorkoutPlanModel.query.filter_by(preset_title="Yoga & Thư giãn").first()
        if not plan:
            print("Không tìm thấy lộ trình Yoga & Thư giãn.")
            return
        
        day1 = DailyWorkoutModel.query.filter_by(plan_id=plan.id, day_number=1).first()
        if day1:
            progress_data = {
                "currentExerciseIndex": 1,
                "lastPlayedIndex": 1,
                "completedIndexes": [0],
                "exerciseProgressMap": {
                    "1": {
                        "videoTimestamp": 15,
                        "exerciseTimeRemaining": 45
                    }
                }
            }
            day1.is_completed = False
            day1.progress_data = progress_data
            db.session.commit()
            print("✅ Đã sửa đúng tiến độ cho lộ trình Yoga & Thư giãn!")
        else:
            print("Không tìm thấy Day 1 của Yoga.")

if __name__ == '__main__':
    fix_progress()
