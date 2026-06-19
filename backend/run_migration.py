from app import app
from database.db import db
from sqlalchemy import text

with app.app_context():
    with open('database/migration/019. create_weight_logs.sql', 'r') as f:
        sql = f.read()
    db.session.execute(text(sql))
    db.session.commit()
    print("Migration 019 completed.")
