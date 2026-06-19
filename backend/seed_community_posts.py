import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.community.community_post_model import CommunityPostModel
from model.auth.user_model import UserModel
from werkzeug.security import generate_password_hash

with app.app_context():
    print("Seeding community posts...")
    
    # Create mock users
    mock_users = [
        {"name": "Phương Thúy (Phương_Fitness)", "email": "phuong_fitness@demo.com", "password": "password123"},
        {"name": "Tuấn Muscle", "email": "tuan_muscle@demo.com", "password": "password123"}
    ]
    
    user_ids = []
    
    for u in mock_users:
        user = UserModel.query.filter_by(email=u["email"]).first()
        if not user:
            user = UserModel(
                name=u["name"],
                email=u["email"],
                password_hash=generate_password_hash(u["password"])
            )
            db.session.add(user)
            db.session.commit()
        user_ids.append(user.id)
        
    # Create mock posts
    mock_posts = [
        {
            "user_id": user_ids[0],
            "caption": "Buổi sáng nhẹ nhàng với bài tập Yoga 15 phút! Tràn đầy năng lượng cho ngày mới 🧘‍♀️✨ Mọi người cùng tập nhé!",
            "kcal": 120,
            "duration_minutes": 15,
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
            "program_title": "Yoga thư giãn cơ bản",
            "likes": 124,
            "comments": 12
        },
        {
            "user_id": user_ids[1],
            "caption": "Push mình tới giới hạn với bài HIIT hôm nay! Cực kỳ mệt nhưng siêu đã 🔥 Bạn nào muốn thử thách độ bền thì lưu giáo án này ngay nhé!",
            "kcal": 540,
            "duration_minutes": 45,
            "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
            "program_title": "HIIT Cường độ cao",
            "likes": 432,
            "comments": 45
        }
    ]
    
    for p in mock_posts:
        # Check if post already exists to avoid duplicates
        existing = CommunityPostModel.query.filter_by(user_id=p["user_id"], caption=p["caption"]).first()
        if not existing:
            post = CommunityPostModel(**p)
            db.session.add(post)
    
    db.session.commit()
    print("Seed complete!")
