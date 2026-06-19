import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from sqlalchemy import text

def update_db_schema():
    with app.app_context():
        try:
            # Add preset_id and workout_data columns
            db.session.execute(text('ALTER TABLE scr_community_posts ADD COLUMN IF NOT EXISTS preset_id VARCHAR(50);'))
            db.session.execute(text('ALTER TABLE scr_community_posts ADD COLUMN IF NOT EXISTS workout_data JSONB;'))
            db.session.commit()
            print("Successfully updated scr_community_posts table.")
        except Exception as e:
            print("Error updating schema:", str(e))
            db.session.rollback()

if __name__ == '__main__':
    update_db_schema()
