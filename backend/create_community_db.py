import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.community.community_post_model import CommunityPostModel, CommunityLikeModel, CommunityCommentModel

with app.app_context():
    print("Creating community tables...")
    db.create_all()
    print("Community tables created successfully!")
