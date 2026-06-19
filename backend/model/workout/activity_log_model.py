from database.db import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

class ActivityLogModel(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id'), nullable=False)
    daily_workout_id = db.Column(UUID(as_uuid=True), db.ForeignKey('daily_workouts.id'), nullable=True)
    activity_name = db.Column(db.String(255), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    calories_burned = db.Column(db.Integer, nullable=False)
    source = db.Column(db.String(50), default='manual') # 'app_workout', 'manual_mets', 'external_device'
    logged_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "activity_name": self.activity_name,
            "duration_minutes": self.duration_minutes,
            "calories_burned": self.calories_burned,
            "source": self.source,
            "logged_at": self.logged_at.isoformat() if self.logged_at else None
        }
