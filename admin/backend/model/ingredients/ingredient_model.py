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
    
    # New fields
    sugar = db.Column(db.Float, default=0)
    fiber = db.Column(db.Float, default=0)
    saturated_fat = db.Column(db.Float, default=0)
    cholesterol = db.Column(db.Float, default=0)
    sodium = db.Column(db.Float, default=0)
    potassium = db.Column(db.Float, default=0)
    calcium = db.Column(db.Float, default=0)
    iron = db.Column(db.Float, default=0)
    vitamin_c = db.Column(db.Float, default=0)
    vitamin_a = db.Column(db.Float, default=0)
    vitamin_d = db.Column(db.Float, default=0)
    
    storage_method = db.Column(db.Text)
    weight_min = db.Column(db.Float)
    weight_max = db.Column(db.Float)
    notes = db.Column(db.Text)
    suitability = db.Column(db.JSON, default=[]) # Lưu danh sách tag ['lose', 'gain']
    
    # AI Data (JSON Arrays)
    unit_conversions = db.Column(db.JSON, default=[])
    substitutions = db.Column(db.JSON, default=[])

    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='SET NULL'))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationship để lấy thông tin người tạo
    creator = db.relationship('UserModel', foreign_keys=[created_by])

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
            "sugar": self.sugar,
            "fiber": self.fiber,
            "saturated_fat": self.saturated_fat,
            "cholesterol": self.cholesterol,
            "sodium": self.sodium,
            "potassium": self.potassium,
            "calcium": self.calcium,
            "iron": self.iron,
            "vitamin_c": self.vitamin_c,
            "vitamin_a": self.vitamin_a,
            "vitamin_d": self.vitamin_d,
            "storage_method": self.storage_method,
            "weight_min": self.weight_min,
            "weight_max": self.weight_max,
            "notes": self.notes,
            "suitability": self.suitability or [],
            "unit_conversions": self.unit_conversions or [],
            "substitutions": self.substitutions or [],
            "created_by": str(self.created_by) if self.created_by else None,
            "creator_email": self.creator.email if self.creator else "Hệ thống",
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
