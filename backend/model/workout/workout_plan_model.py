from database.db import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB

class WorkoutPlanModel(db.Model):
    __tablename__ = 'workout_plans'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id'), nullable=False)
    goal = db.Column(db.String(255), nullable=True) # e.g. "Giảm mỡ", "Tăng cơ"
    difficulty = db.Column(db.String(50), nullable=True)
    total_days = db.Column(db.Integer, default=7)
    
    preset_id = db.Column(db.String(50), nullable=True)
    preset_title = db.Column(db.String(255), nullable=True)
    preset_image = db.Column(db.String(1000), nullable=True)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationship
    daily_workouts = db.relationship('DailyWorkoutModel', backref='plan', lazy=True, cascade="all, delete-orphan", order_by="DailyWorkoutModel.day_number")

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "goal": self.goal,
            "difficulty": self.difficulty,
            "total_days": self.total_days,
            "preset_id": self.preset_id,
            "preset_title": self.preset_title,
            "preset_image": self.preset_image,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "daily_workouts": [dw.to_dict() for dw in self.daily_workouts]
        }

class DailyWorkoutModel(db.Model):
    __tablename__ = 'daily_workouts'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('workout_plans.id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=False) # 1, 2, 3...
    is_unlocked = db.Column(db.Boolean, default=False)
    is_completed = db.Column(db.Boolean, default=False)
    title = db.Column(db.String(255), nullable=True)
    duration_minutes = db.Column(db.Integer, default=0)
    calories = db.Column(db.Integer, default=0)
    
    # Store the complex structure of exercises directly as JSONB
    # Format: { "sections": [ { "title": "Khởi động", "data": [ ... ] } ] }
    exercises_data = db.Column(JSONB, nullable=False, default=dict)
    progress_data = db.Column(JSONB, nullable=True, default=dict)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "plan_id": str(self.plan_id),
            "day_number": self.day_number,
            "is_unlocked": self.is_unlocked,
            "is_completed": self.is_completed,
            "title": self.title,
            "duration_minutes": self.duration_minutes,
            "calories": self.calories,
            "exercises_data": self.exercises_data,
            "progress_data": self.progress_data,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
