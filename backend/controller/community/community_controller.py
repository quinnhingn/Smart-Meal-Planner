from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
import uuid
import hashlib

from database.db import db
from model.community.community_post_model import CommunityPostModel
from model.auth.user_model import UserModel

community_bp = Blueprint('community', __name__, url_prefix='/api/community')

# Thư mục lưu ảnh upload
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'community')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Danh sách hình đại diện ngẫu nhiên cho user chưa có avatar
ANIMAL_AVATARS = [
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lucky",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Happy",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Peanut",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Snickers",
    "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Milo"
]

def get_avatar_for_user(user_id_str):
    # Dùng hàm băm đơn giản để luôn trả về 1 avatar cố định cho 1 user
    hash_val = int(hashlib.md5(user_id_str.encode()).hexdigest(), 16)
    return ANIMAL_AVATARS[hash_val % len(ANIMAL_AVATARS)]

@community_bp.route('/posts', methods=['GET'])
@jwt_required(optional=True)
def get_posts():
    try:
        current_user_id = get_jwt_identity()
        posts = CommunityPostModel.query.order_by(CommunityPostModel.created_at.desc()).all()
        
        result = []
        for p in posts:
            p_dict = p.to_dict()
            p_dict['avatar'] = get_avatar_for_user(str(p.user_id))
            
            is_liked = False
            if current_user_id:
                from model.community.community_post_model import CommunityLikeModel
                like = CommunityLikeModel.query.filter_by(post_id=p.id, user_id=current_user_id).first()
                if like:
                    is_liked = True
            p_dict['is_liked'] = is_liked
            
            result.append(p_dict)
            
        return jsonify({
            "status": "success",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

import json
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
from database.db import db
import uuid
from datetime import datetime

@community_bp.route('/posts/<post_id>/save', methods=['POST'])
@jwt_required()
def save_post_to_personal(post_id):
    try:
        user_id = get_jwt_identity()
        post = CommunityPostModel.query.get(post_id)
        if not post:
            return jsonify({"status": "error", "message": "Post not found"}), 404

        if not post.workout_data:
            return jsonify({"status": "error", "message": "Bài đăng này không có dữ liệu bài tập để lưu."}), 400

        workout_data = post.workout_data
        
        # Create a new WorkoutPlanModel for the user based on the post's workout data
        title = workout_data.get("title", post.program_title or "Lộ trình từ Cộng đồng")
        
        new_plan = WorkoutPlanModel(
            user_id=user_id,
            preset_title=title,
            goal=workout_data.get("goal", "Duy trì vóc dáng"),
            difficulty=workout_data.get("difficulty", "Trung bình"),
            total_days=1,
            preset_id=str(post.id),
            preset_image=workout_data.get("image", post.image_url) or "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500"
        )
        db.session.add(new_plan)
        db.session.commit() # to get new_plan.id

        # Check if the workout_data has preview_schedule (meaning it's a preset format)
        if "preview_schedule" in workout_data:
            schedule = workout_data["preview_schedule"]
            for day_data in schedule:
                new_day = DailyWorkoutModel(
                    plan_id=new_plan.id,
                    day_number=day_data["day"],
                    title=day_data["title"],
                    duration_minutes=int(post.duration_minutes) if post.duration_minutes else 0,
                    calories=int(post.kcal) if post.kcal else 0,
                    exercises_data=day_data.get("exercises", []),
                    is_completed=False,
                    is_unlocked=(day_data["day"] == 1)
                )
                db.session.add(new_day)
        else:
            # Maybe it's a single day workout
            exercises = workout_data.get("exercises", [])
            exercises_data = {
                "sections": [
                    {
                        "title": "Bài tập chia sẻ",
                        "data": exercises
                    }
                ]
            }
            new_day = DailyWorkoutModel(
                plan_id=new_plan.id,
                day_number=1,
                title=f"Ngày 1: {title}",
                duration_minutes=int(post.duration_minutes) if post.duration_minutes else 0,
                calories=int(post.kcal) if post.kcal else 0,
                exercises_data=exercises_data,
                is_completed=False,
                is_unlocked=True
            )
            db.session.add(new_day)
            
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Đã lưu vào Cá nhân thành công!",
            "data": {"plan_id": str(new_plan.id)}
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    try:
        user_id = get_jwt_identity()
        
        # Nhận form data
        caption = request.form.get('caption', '')
        
        kcal_str = request.form.get('kcal', '').strip()
        kcal = int(kcal_str) if kcal_str else 0
        
        duration_str = request.form.get('duration_minutes', '').strip()
        duration_minutes = int(duration_str) if duration_str else 0
        
        program_title = request.form.get('program_title', '')
        preset_id = request.form.get('preset_id', None)
        workout_data_str = request.form.get('workout_data', None)
        
        workout_data = None
        if workout_data_str:
            try:
                workout_data = json.loads(workout_data_str)
            except:
                pass
        
        image_url = None
        
        # Xử lý file upload
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Gắn thêm uuid để không trùng tên
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(file_path)
                
                # Trả về URL nội bộ (sẽ host qua app.py)
                image_url = f"/uploads/community/{unique_filename}"
                
        new_post = CommunityPostModel(
            user_id=user_id,
            caption=caption,
            kcal=kcal,
            duration_minutes=duration_minutes,
            program_title=program_title,
            image_url=image_url,
            preset_id=preset_id,
            workout_data=workout_data
        )
        
        db.session.add(new_post)
        db.session.commit()
        
        p_dict = new_post.to_dict()
        p_dict['avatar'] = get_avatar_for_user(str(user_id))
        
        return jsonify({
            "status": "success",
            "message": "Đăng bài thành công!",
            "data": p_dict
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route('/posts/<post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    try:
        user_id = get_jwt_identity()
        from model.community.community_post_model import CommunityLikeModel, CommunityPostModel
        
        post = CommunityPostModel.query.get(post_id)
        if not post:
            return jsonify({"status": "error", "message": "Bài viết không tồn tại"}), 404
            
        existing_like = CommunityLikeModel.query.filter_by(post_id=post_id, user_id=user_id).first()
        
        if existing_like:
            db.session.delete(existing_like)
            post.likes = max(0, post.likes - 1)
            action = "unliked"
        else:
            new_like = CommunityLikeModel(post_id=post_id, user_id=user_id)
            db.session.add(new_like)
            post.likes += 1
            action = "liked"
            
        db.session.commit()
        
        return jsonify({
            "status": "success", 
            "action": action, 
            "likes": post.likes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        from model.community.community_post_model import CommunityCommentModel
        comments = CommunityCommentModel.query.filter_by(post_id=post_id).order_by(CommunityCommentModel.created_at.asc()).all()
        return jsonify({
            "status": "success",
            "data": [c.to_dict() for c in comments]
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    try:
        user_id = get_jwt_identity()
        from model.community.community_post_model import CommunityCommentModel, CommunityPostModel
        
        if request.content_type and 'multipart/form-data' in request.content_type:
            content = request.form.get('content', '').strip()
            image_file = request.files.get('image')
        else:
            data = request.get_json() or {}
            content = data.get('content', '').strip()
            image_file = None
            
        # Support empty text if there is an image
        if not content and not image_file:
            return jsonify({"status": "error", "message": "Nội dung bình luận không được rỗng"}), 400
            
        post = CommunityPostModel.query.get(post_id)
        if not post:
            return jsonify({"status": "error", "message": "Bài viết không tồn tại"}), 404
            
        image_url = None
        if image_file and image_file.filename != '':
            if not allowed_file(image_file.filename):
                return jsonify({"status": "error", "message": "Định dạng file không hỗ trợ"}), 400
            filename = secure_filename(image_file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            image_file.save(filepath)
            image_url = f"/uploads/community/{unique_filename}"
            
        new_comment = CommunityCommentModel(
            post_id=post_id,
            user_id=user_id,
            content=content,
            image_url=image_url
        )
        db.session.add(new_comment)
        
        post.comments += 1
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": new_comment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route('/posts/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    try:
        user_id = get_jwt_identity()
        from model.community.community_post_model import CommunityPostModel
        
        post = CommunityPostModel.query.get(post_id)
        if not post:
            return jsonify({"status": "error", "message": "Bài viết không tồn tại"}), 404
            
        if str(post.user_id) != str(user_id):
            return jsonify({"status": "error", "message": "Không có quyền xóa bài viết này"}), 403
            
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Đã xóa bài viết thành công"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
