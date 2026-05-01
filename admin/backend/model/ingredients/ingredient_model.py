from database.db import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID

class IngredientModel(db.Model):
    __tablename__ = 'scr_ingredients'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name_vn = db.Column(db.String(255), nullable=False)
    name_en = db.Column(db.String(255))
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(500))
    default_unit = db.Column(db.String(50))
    gram_per_unit = db.Column(db.Float)
    calories_per_100g = db.Column(db.Float, nullable=False)
    protein_per_100g = db.Column(db.Float, default=0)
    fat_per_100g = db.Column(db.Float, default=0)
    carbs_per_100g = db.Column(db.Float, default=0)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='SET NULL'))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name_vn": self.name_vn,
            "name_en": self.name_en,
            "category": self.category,
            "image_url": self.image_url,
            "default_unit": self.default_unit,
            "gram_per_unit": self.gram_per_unit,
            "calories_per_100g": self.calories_per_100g,
            "protein_per_100g": self.protein_per_100g,
            "fat_per_100g": self.fat_per_100g,
            "carbs_per_100g": self.carbs_per_100g,
            "created_by": str(self.created_by) if self.created_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
