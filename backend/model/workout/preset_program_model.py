from database.db import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
import uuid

class PresetProgramModel(db.Model):
    __tablename__ = 'preset_programs'

    id = db.Column(db.String(50), primary_key=True) # e.g. "p1", "p2"
    title = db.Column(db.String(255), nullable=False)
    goal = db.Column(db.String(255), nullable=True)
    difficulty = db.Column(db.String(50), nullable=True)
    duration_days = db.Column(db.Integer, default=7)
    calories_per_day = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(1000), nullable=True)
    description = db.Column(db.Text, nullable=True)
    suitable_time = db.Column(db.String(255), nullable=True)
    focus_areas = db.Column(JSONB, nullable=True, default=list) # e.g. ['Toàn thân', 'Tim mạch']
    daily_avg_duration = db.Column(db.String(50), nullable=True)
    preview_schedule = db.Column(JSONB, nullable=True, default=list)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "goal": self.goal,
            "difficulty": self.difficulty,
            "duration_days": self.duration_days,
            "calories_per_day": self.calories_per_day,
            "image": self.image,
            "description": self.description,
            "suitable_time": self.suitable_time,
            "focus_areas": self.focus_areas,
            "daily_avg_duration": self.daily_avg_duration,
            "preview_schedule": self.preview_schedule,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
