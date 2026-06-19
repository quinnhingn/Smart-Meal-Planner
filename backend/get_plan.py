import json
from app import app
from model.workout.workout_plan_model import WorkoutPlanModel

with app.app_context():
    plan = WorkoutPlanModel.query.first()
    if plan:
        print(json.dumps(plan.daily_workouts[0], indent=2))
    else:
        print("No plans")
