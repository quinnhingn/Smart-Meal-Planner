import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

with app.app_context():
    print("Deleting old workout plans without preset_id...")
    # Find old plans
    old_plans = WorkoutPlanModel.query.filter(WorkoutPlanModel.preset_id == None).all()
    count = 0
    for plan in old_plans:
        db.session.delete(plan)
        count += 1
    
    db.session.commit()
    print(f"Deleted {count} old plans successfully!")
