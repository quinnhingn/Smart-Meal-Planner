import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.community.community_post_model import CommunityPostModel

with app.app_context():
    print("Deleting posts without images...")
    
    # Xoá các post có image_url bị rỗng hoặc null
    bad_posts = CommunityPostModel.query.filter(
        (CommunityPostModel.image_url == None) | (CommunityPostModel.image_url == '')
    ).all()
    
    count = 0
    for p in bad_posts:
        db.session.delete(p)
        count += 1
        
    db.session.commit()
    print(f"Deleted {count} bad posts.")
