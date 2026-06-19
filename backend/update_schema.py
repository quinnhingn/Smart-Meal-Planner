import os
from dotenv import load_dotenv
import sqlalchemy

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(DATABASE_URL)
with engine.connect() as conn:
    print("Checking daily_workouts columns...")
    res = conn.execute(sqlalchemy.text("SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_workouts';"))
    columns = [row[0] for row in res]
    print(columns)
    
    if "is_unlocked" not in columns:
        print("Adding is_unlocked...")
        conn.execute(sqlalchemy.text("ALTER TABLE daily_workouts ADD COLUMN is_unlocked BOOLEAN DEFAULT FALSE;"))
    if "is_completed" not in columns:
        print("Adding is_completed...")
        conn.execute(sqlalchemy.text("ALTER TABLE daily_workouts ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;"))
    if "progress_data" not in columns:
        print("Adding progress_data...")
        conn.execute(sqlalchemy.text("ALTER TABLE daily_workouts ADD COLUMN progress_data JSONB DEFAULT '{}';"))
    if "exercises_data" not in columns:
        print("Adding exercises_data...")
        conn.execute(sqlalchemy.text("ALTER TABLE daily_workouts ADD COLUMN exercises_data JSONB DEFAULT '{}';"))
        
    conn.commit()
    print("DB Schema Updated successfully!")
