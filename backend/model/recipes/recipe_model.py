from database.db import db
from datetime import datetime

class RecipeModel(db.Model):
    __tablename__ = 'scr_recipes'

    id = db.Column(db.Integer, primary_key=True)
    name_vn = db.Column(db.String(255), nullable=False)
    name_en = db.Column(db.String(255))
    image_url = db.Column(db.String(500))
    video_url = db.Column(db.String(500))
    category = db.Column(db.String(100))
    difficulty = db.Column(db.String(50))
    cooking_time = db.Column(db.String(100))
    ingredients = db.Column(db.JSON)  # Lưu danh sách nguyên liệu JSON
    steps = db.Column(db.JSON)        # Lưu các bước nấu JSON
    servings = db.Column(db.String(100))
    goals = db.Column(db.JSON)         # VD: ["lose", "keto"]
    meal_times = db.Column(db.JSON)    # VD: ["breakfast", "lunch"]
    
    # Relationship sang bảng calo
    nutrition = db.relationship('DishCaloriesModel', backref='recipe', uselist=False)

class DishCaloriesModel(db.Model):
    __tablename__ = 'scr_dishes_calories'

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('scr_recipes.id'), unique=True)
    calories = db.Column(db.Float, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fat = db.Column(db.Float, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat
        }

from sqlalchemy.dialects.postgresql import UUID

class UserPantryModel(db.Model):
    __tablename__ = 'scr_user_pantry'
    id = db.Column(UUID(as_uuid=True), primary_key=True)
    user_id = db.Column(db.String(36), nullable=False)
    ingredient_name = db.Column(db.String(255), nullable=False)
    ingredient_id = db.Column(db.Integer, nullable=True)
    quantity = db.Column(db.Float, default=1.0)
    unit = db.Column(db.String(50), default='g')
    storage_location = db.Column(db.String(50), default='fridge')
    expiry_date = db.Column(db.Date, nullable=True)
    source = db.Column(db.String(50), default='ai_scan')
    added_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.ingredient_name,
            'quantity': self.quantity,
            'unit': self.unit,
            'storage': self.storage_location,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'addedAt': self.added_at.isoformat() # Đổi thành addedAt cho App dễ đọc
        }

class AIScanLogModel(db.Model):
    __tablename__ = 'scr_ai_scan_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True)
    user_id = db.Column(db.Text, db.ForeignKey('scr_users.id'))
    scan_type = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(500))
    ai_result = db.Column(db.JSON)
    confirmed_dish_id = db.Column(db.Integer)
    was_corrected = db.Column(db.Boolean, default=False)
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow)

class MealLogModel(db.Model):
    __tablename__ = 'scr_meal_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True)
    user_id = db.Column(db.Text, db.ForeignKey('scr_users.id'))
    recipe_id = db.Column(db.Integer, db.ForeignKey('scr_recipes.id'))
    meal_name = db.Column(db.String(255), nullable=False)
    meal_type = db.Column(db.String(50), nullable=False)
    servings = db.Column(db.Float, default=1.0)
    calories_consumed = db.Column(db.Float, nullable=False)
    protein_g = db.Column(db.Float)
    fat_g = db.Column(db.Float)
    carbs_g = db.Column(db.Float)
    eaten_at = db.Column(db.DateTime, default=datetime.utcnow)

class PantryHistoryModel(db.Model):
    __tablename__ = 'scr_pantry_history'
    id = db.Column(UUID(as_uuid=True), primary_key=True)
    user_id = db.Column(db.String(36), nullable=False)
    ingredient_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50))
    action_type = db.Column(db.String(50)) # 'consumed', 'discarded', 'added'
    recipe_id = db.Column(db.Integer, nullable=True)
    recipe_name = db.Column(db.String(255))
    action_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.ingredient_name,
            'quantity': self.quantity,
            'unit': self.unit,
            'action': self.action_type,
            'recipeId': self.recipe_id,
            'recipeName': self.recipe_name,
            'usedAt': self.action_at.isoformat()
        }
