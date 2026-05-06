from database.db import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB

class UserProfileModel(db.Model):
    __tablename__ = 'scr_user_profiles'

    id = db.Column(UUID(as_uuid=True), primary_key=True, server_default=db.text("gen_random_uuid()"))
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='CASCADE'), unique=True, nullable=False)
    
    # Cơ bản
    gender = db.Column(db.String(20))
    age = db.Column(db.Integer)
    height_cm = db.Column(db.Float)
    weight_kg = db.Column(db.Float)
    target_weight_kg = db.Column(db.Float)
    
    # Chỉ số & Mục tiêu
    activity_level = db.Column(db.Float) # factor ví dụ: 1.2, 1.375...
    goal = db.Column(db.String(50))
    body_type = db.Column(db.String(20))
    pace = db.Column(db.String(20))
    
    # Sở thích & Dị ứng
    dietary_preference = db.Column(db.String(100))
    allergies = db.Column(JSONB, default=[])
    dislikes = db.Column(JSONB, default=[])
    
    # Kết quả tính toán
    bmi = db.Column(db.Float)
    tdee = db.Column(db.Float)
    target_calories = db.Column(db.Integer)
    target_protein_g = db.Column(db.Float)
    target_carbs_g = db.Column(db.Float)
    target_fat_g = db.Column(db.Float)
    estimated_weeks = db.Column(db.Integer)
    
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "gender": self.gender,
            "age": self.age,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "target_weight_kg": self.target_weight_kg,
            "activity_level": self.activity_level,
            "goal": self.goal,
            "body_type": self.body_type,
            "pace": self.pace,
            "dietary_preference": self.dietary_preference,
            "allergies": self.allergies,
            "dislikes": self.dislikes,
            "bmi": self.bmi,
            "tdee": self.tdee,
            "target_calories": self.target_calories,
            "target_protein_g": self.target_protein_g,
            "target_carbs_g": self.target_carbs_g,
            "target_fat_g": self.target_fat_g,
            "estimated_weeks": self.estimated_weeks,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
