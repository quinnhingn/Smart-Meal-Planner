from database.db import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

class FavoriteRecipeModel(db.Model):
    __tablename__ = 'scr_user_favorite_recipes'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('scr_recipes.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "recipe_id": self.recipe_id,
            "created_at": self.created_at.isoformat()
        }
