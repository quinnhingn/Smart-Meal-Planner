from database.db import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB

class ReviewModel(db.Model):
    __tablename__ = 'scr_reviews'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_id = db.Column(db.Integer, db.ForeignKey('scr_recipes.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    tags = db.Column(JSONB, default=[])
    images = db.Column(JSONB, default=[])
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "recipeId": self.recipe_id,
            "userId": str(self.user_id),
            "rating": self.rating,
            "text": self.comment,
            "tags": self.tags,
            "images": self.images,
            "createdAt": self.created_at.isoformat()
        }
