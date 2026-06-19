from database.db import db
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

class CommunityPostModel(db.Model):
    __tablename__ = 'scr_community_posts'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='CASCADE'), nullable=False)
    
    caption = db.Column(db.Text, nullable=True)
    kcal = db.Column(db.Integer, nullable=True, default=0)
    duration_minutes = db.Column(db.Integer, nullable=True, default=0)
    image_url = db.Column(db.String(500), nullable=True)
    program_title = db.Column(db.String(255), nullable=True)
    preset_id = db.Column(db.String(50), nullable=True)
    from sqlalchemy.dialects.postgresql import JSONB
    workout_data = db.Column(JSONB, nullable=True)
    
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = db.relationship('UserModel', backref=db.backref('community_posts', lazy=True, cascade="all, delete"))

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "user_name": self.user.name if self.user else "Người dùng ẩn danh",
            "caption": self.caption,
            "kcal": self.kcal,
            "duration_minutes": self.duration_minutes,
            "image_url": self.image_url,
            "program_title": self.program_title,
            "preset_id": self.preset_id,
            "workout_data": self.workout_data,
            "likes": self.likes,
            "comments": self.comments,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class CommunityLikeModel(db.Model):
    __tablename__ = 'scr_community_likes'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='CASCADE'), nullable=False)
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_community_posts.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    user = db.relationship('UserModel')
    post = db.relationship('CommunityPostModel', backref=db.backref('post_likes', lazy=True, cascade="all, delete"))

class CommunityCommentModel(db.Model):
    __tablename__ = 'scr_community_comments'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_users.id', ondelete='CASCADE'), nullable=False)
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scr_community_posts.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    user = db.relationship('UserModel')
    post = db.relationship('CommunityPostModel', backref=db.backref('post_comments', lazy=True, cascade="all, delete"))

    def to_dict(self):
        from controller.community.community_controller import get_avatar_for_user
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "user_name": self.user.name if self.user else "Người dùng ẩn danh",
            "avatar": get_avatar_for_user(str(self.user_id)),
            "post_id": str(self.post_id),
            "content": self.content,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
