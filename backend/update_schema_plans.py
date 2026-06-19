import os
from dotenv import load_dotenv
import sqlalchemy

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(DATABASE_URL)
with engine.connect() as conn:
    print("Checking workout_plans columns...")
    res = conn.execute(sqlalchemy.text("SELECT column_name FROM information_schema.columns WHERE table_name = 'workout_plans';"))
    columns = [row[0] for row in res]
    
    if "preset_id" not in columns:
        print("Adding preset_id...")
        conn.execute(sqlalchemy.text("ALTER TABLE workout_plans ADD COLUMN preset_id VARCHAR(50);"))
    if "preset_title" not in columns:
        print("Adding preset_title...")
        conn.execute(sqlalchemy.text("ALTER TABLE workout_plans ADD COLUMN preset_title VARCHAR(255);"))
    if "preset_image" not in columns:
        print("Adding preset_image...")
        conn.execute(sqlalchemy.text("ALTER TABLE workout_plans ADD COLUMN preset_image VARCHAR(1000);"))
        
    conn.commit()
    print("DB Schema Updated successfully!")
