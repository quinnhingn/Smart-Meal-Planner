import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def set_progress_day1():
    with app.app_context():
        # Lấy lộ trình đầu tiên
        plan = WorkoutPlanModel.query.first()
        if not plan:
            print("Không tìm thấy lộ trình nào trong DB.")
            return
        
        # Lấy ngày 1
        day1 = DailyWorkoutModel.query.filter_by(plan_id=plan.id, day_number=1).first()
        if day1:
            # Đang tập bài tập 2 (index 1), bài 1 (index 0) đã xong
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
            # Set is_completed = False if it was True
            day1.is_completed = False
            day1.progress_data = progress_data
            db.session.commit()
            print("✅ Đã cập nhật tiến độ Day 1: đang tập dở bài 2.")
        else:
            print("Không tìm thấy Day 1.")

if __name__ == '__main__':
    set_progress_day1()
