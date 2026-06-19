from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE scr_community_comments ADD COLUMN image_url VARCHAR(255);'))
        db.session.commit()
        print("Successfully added image_url to scr_community_comments")
    except Exception as e:
        print(f"Error or already exists: {e}")
        db.session.rollback()
