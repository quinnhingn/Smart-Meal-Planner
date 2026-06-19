from app import app
from database.db import db
from sqlalchemy import text

with app.app_context():
    sql = """
    ALTER TABLE activity_logs ADD COLUMN daily_workout_id UUID NULL REFERENCES daily_workouts(id);
    """
    db.session.execute(text(sql))
    db.session.commit()
    print("Added daily_workout_id to activity_logs")
