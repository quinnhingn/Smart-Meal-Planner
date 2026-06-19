import os
from dotenv import load_dotenv
import sqlalchemy

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(DATABASE_URL)
with engine.connect() as conn:
    print("Deleting old workout plans...")
    conn.execute(sqlalchemy.text("DELETE FROM daily_workouts;"))
    conn.execute(sqlalchemy.text("DELETE FROM workout_plans;"))
    conn.commit()
    print("Deleted successfully!")
