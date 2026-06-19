import os
from dotenv import load_dotenv
import sqlalchemy

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(sqlalchemy.text("SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_workouts';"))
    for row in res:
        print(row[0])
