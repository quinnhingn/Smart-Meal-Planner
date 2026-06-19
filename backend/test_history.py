from app import app
from database.db import db
from model.auth.user_model import UserModel
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

with app.app_context():
    user = UserModel.query.filter_by(email='test02@gmail.com').first()
    results = db.session.query(DailyWorkoutModel, WorkoutPlanModel)\
        .join(WorkoutPlanModel, DailyWorkoutModel.plan_id == WorkoutPlanModel.id)\
        .filter(WorkoutPlanModel.user_id == str(user.id), DailyWorkoutModel.is_completed == True)\
        .order_by(DailyWorkoutModel.completed_at.desc())\
        .all()
    print("Found completed workouts:", len(results))
    for day, plan in results:
        print(day.id, day.calories, day.completed_at)
