from app import app
from database.db import db
from model.users.user_model import UserModel
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

with app.app_context():
    user = UserModel.query.filter_by(email='test02@gmail.com').first()
    if not user:
        print("User not found")
    else:
        print(f"User ID: {user.id}")
        plans = WorkoutPlanModel.query.filter_by(user_id=user.id).all()
        print(f"Found {len(plans)} plans")
        
        for p in plans:
            completed_days = DailyWorkoutModel.query.filter_by(plan_id=p.id, is_completed=True).all()
            for d in completed_days:
                print(f"Plan {p.id} -> Day {d.day_number} is completed at {d.completed_at}. Calories: {d.calories}")
