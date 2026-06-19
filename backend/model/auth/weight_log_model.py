from database.db import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid

class WeightLogModel(db.Model):
    __tablename__ = 'weight_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='CASCADE'), nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    logged_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "weight_kg": self.weight_kg,
            "logged_at": self.logged_at.isoformat() if self.logged_at else None
        }
