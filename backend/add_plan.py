from database.db import db
from app import app
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
import uuid

with app.app_context():
    existing = WorkoutPlanModel.query.first()
    if existing:
        new_plan = WorkoutPlanModel(
            user_id=existing.user_id,
            goal="Giảm mỡ nhanh",
            difficulty="Nâng cao",
            total_days=7
        )
        db.session.add(new_plan)
        db.session.flush()
        
        for day in existing.daily_workouts:
            new_day = DailyWorkoutModel(
                plan_id=new_plan.id,
                day_number=day.day_number,
                is_unlocked=day.is_unlocked,
                is_completed=day.is_completed,
                title=day.title + " (Mới)",
                duration_minutes=day.duration_minutes,
                calories=day.calories,
                exercises_data=day.exercises_data
            )
            db.session.add(new_day)
        
        db.session.commit()
        print("Added a new plan successfully.")
    else:
        print("No existing plan found.")
