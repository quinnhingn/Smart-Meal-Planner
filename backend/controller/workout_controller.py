from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
from model.workout.preset_program_model import PresetProgramModel
from model.auth.user_profile_model import UserProfileModel
import google.generativeai as genai
import os
import json
import requests
from datetime import datetime

workout_bp = Blueprint('workout', __name__, url_prefix='/api/workout')

# Config Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

@workout_bp.route('/presets', methods=['GET'])
@jwt_required()
def get_presets():
    try:
        presets = PresetProgramModel.query.all()
        return jsonify({
            "status": "success",
            "data": [p.to_dict() for p in presets]
        }), 200
    except Exception as e:
        print(f"Error fetching presets: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@workout_bp.route('/ai/search', methods=['POST'])
@jwt_required()
def search_workout_ai():
    try:
        data = request.get_json()
        query = data.get('query', '')
        if not query:
            return jsonify({"status": "error", "message": "Vui lòng nhập yêu cầu tìm kiếm"}), 400
            
        tavily_key = os.environ.get("TAVILY_API_KEY")
        if not tavily_key:
            return jsonify({"status": "error", "message": "Chưa cấu hình TAVILY_API_KEY trên server"}), 500
            
        # Call Tavily
        headers = {"Content-Type": "application/json"}
        payload = {
            "api_key": tavily_key,
            "query": f"site:youtube.com {query} workout tập thể dục",
            "search_depth": "basic",
            "include_images": False,
            "include_answer": False,
            "max_results": 5
        }
        
        response = requests.post("https://api.tavily.com/search", json=payload, headers=headers)
        if response.status_code != 200:
            return jsonify({"status": "error", "message": "Lỗi khi kết nối với Tavily AI"}), 500
            
        result = response.json()
        results = result.get('results', [])
        
        if not results:
            return jsonify({"status": "error", "message": "Không tìm thấy bài tập phù hợp"}), 404
            
        # Grab up to 3 matching youtube links
        matches = []
        for r in results:
            if "youtube.com/watch" in r.get('url', '') or "youtu.be/" in r.get('url', ''):
                matches.append({
                    "title": r.get('title', 'Video Bài Tập Gợi Ý'),
                    "url": r.get('url'),
                    "content": r.get('content', '')
                })
            if len(matches) == 3:
                break
                
        if not matches:
            return jsonify({"status": "error", "message": "Không tìm thấy video YouTube phù hợp từ AI"}), 404
            
        return jsonify({
            "status": "success",
            "data": matches
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@workout_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_plan():
    try:
        user_id = get_jwt_identity()
        data = request.json
        goal = data.get('goal', 'Tăng cường sức khoẻ')
        difficulty = data.get('difficulty', 'Người mới')
        duration_days = int(data.get('duration_days', 7))
        
        # (Không còn xoá lộ trình cũ nữa để hỗ trợ Đa lộ trình)
        
        # Fetch User Profile
        profile = UserProfileModel.query.filter_by(user_id=user_id).first()
        bmi = profile.bmi if profile and profile.bmi else 22.0
        
        print(f"🤖 [AI Workout] Đang tạo lộ trình {duration_days} ngày cho user BMI={bmi}, goal={goal}")
        
        preset_id = data.get('preset_id')
        preset_title = data.get('preset_title')
        preset_image = data.get('preset_image')

        # Xoá lộ trình cũ nếu trùng preset_id để tránh bị lặp (duplicate)
        if preset_id:
            WorkoutPlanModel.query.filter_by(user_id=user_id, preset_id=preset_id).delete()
            db.session.commit()
            print(f"🗑️ Đã xoá lộ trình cũ trùng lặp với preset_id: {preset_id}")

        preview_schedule = data.get('preview_schedule', None)
        
        # -------------------------------------------------------------
        # Thuật toán sinh giáo án tập luyện tĩnh thay vì dùng API
        # -------------------------------------------------------------
        base_calories = 200
        base_duration = 20
        
        # Điều chỉnh dựa trên Mục tiêu
        if "Giảm mỡ" in goal:
            base_calories += 100
            base_duration += 10
        elif "Tăng cơ" in goal:
            base_calories += 50
            base_duration += 15
            
        # Điều chỉnh dựa trên Độ khó
        if difficulty == "Trung bình":
            base_calories += 50
            base_duration += 10
        elif difficulty == "Nâng cao":
            base_calories += 150
            base_duration += 20
            
        result_days = []
        
        if preview_schedule and isinstance(preview_schedule, list) and len(preview_schedule) > 0:
            # Dùng luôn dữ liệu preview từ frontend truyền xuống
            for item in preview_schedule:
                day_num = item.get('day', 1)
                day_title = item.get('title', f"Ngày {day_num}")
                
                # Convert exercises array to sections array format expected by DB
                exercises = item.get('exercises', [])
                sections = []
                if exercises:
                    section_data = []
                    for idx, ex in enumerate(exercises):
                        # Attempt to extract duration/reps from 'duration' string like "60 giây x 3" or "15 reps"
                        dur_str = str(ex.get('duration', ''))
                        reps_val = None
                        dur_sec = None
                        if 'phút' in dur_str:
                            try: dur_sec = int(dur_str.split(' ')[0]) * 60
                            except: dur_sec = 300
                        elif 'giây' in dur_str:
                            try: dur_sec = int(dur_str.split(' ')[0])
                            except: dur_sec = 60
                        elif 'reps' in dur_str:
                            try: reps_val = int(dur_str.split(' ')[0])
                            except: reps_val = 15
                            
                        
                        # Danh sách video dự phòng (working videos)
                        working_videos = [
                            "https://www.youtube.com/watch?v=tj00AQnU12Q", # Jumping Jacks
                            "https://www.youtube.com/watch?v=vc1E5CfRfoo", # Squat
                            "https://www.youtube.com/watch?v=IODxDxX7oi4", # Push up
                            "https://www.youtube.com/watch?v=pSHjTRCQxIw", # Plank
                            "https://www.youtube.com/watch?v=2pLT-olgUJs"  # Burpee
                        ]
                        vid_url = working_videos[idx % len(working_videos)]

                        section_data.append({
                            "id": f"e{day_num}_{idx+1}",
                            "name_vn": ex.get('name', 'Bài tập'),
                            "duration_seconds": dur_sec,
                            "reps": reps_val,
                            "thumbnail": ex.get('thumb', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
                            "videoUrl": ex.get('videoUrl', vid_url),
                            "instructions": ["Theo dõi video để tập đúng"],
                            "tips": "Tập luyện an toàn"
                        })
                    
                    sections.append({
                        "id": f"s{day_num}_1",
                        "title": "Danh sách bài tập",
                        "data": section_data
                    })
                    
                result_days.append({
                    "day_number": day_num,
                    "title": day_title,
                    "duration_minutes": base_duration,
                    "calories": base_calories,
                    "sections": sections
                })
        else:
            # Fallback nếu không có preview_schedule
            for i in range(1, duration_days + 1):
                # Tuỳ chỉnh ngày tập theo số chẵn lẻ
                if i % 2 != 0:
                    day_title = f"Ngày {i}: Cardio Đốt Mỡ" if "Giảm mỡ" in goal else f"Ngày {i}: Sức mạnh toàn thân"
                else:
                    day_title = f"Ngày {i}: Phục Hồi Chủ Động"
                    
                sections = [
                    {
                        "id": f"s{i}_1",
                        "title": "Phần 1: Khởi động",
                        "data": [
                            {
                                "id": f"e{i}_1",
                                "name_vn": "Jumping Jacks",
                                "duration_seconds": 60,
                                "reps": None,
                                "thumbnail": "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800",
                                "videoUrl": "https://www.youtube.com/watch?v=iSSAk4XCsZg",
                                "instructions": ["Đứng thẳng", "Bật nhảy dang rộng tay chân"],
                                "tips": "Giữ nhịp thở đều"
                            }
                        ]
                    },
                    {
                        "id": f"s{i}_2",
                        "title": "Phần 2: Bài tập chính",
                        "data": [
                            {
                                "id": f"e{i}_2",
                                "name_vn": "Squats cơ bản" if "Giảm mỡ" in goal else "Chống đẩy (Push-up)",
                                "duration_seconds": None,
                                "reps": 15 if difficulty == "Người mới" else 20,
                                "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
                                "videoUrl": "https://www.youtube.com/watch?v=aclHkVaku9U",
                                "instructions": ["Hạ thấp trọng tâm", "Đẩy người lên"],
                                "tips": "Lưng thẳng, gồng cơ core"
                            },
                            {
                                "id": f"e{i}_3",
                                "name_vn": "Plank",
                                "duration_seconds": 30 if difficulty == "Người mới" else 60,
                                "reps": None,
                                "thumbnail": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800",
                                "videoUrl": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
                                "instructions": ["Giữ người thẳng", "Siết chặt cơ bụng và mông"],
                                "tips": "Đừng để võng lưng"
                            }
                        ]
                    }
                ]
                
                result_days.append({
                    "day_number": i,
                    "title": day_title,
                    "duration_minutes": base_duration,
                    "calories": base_calories,
                    "sections": sections
                })

        result = {
            "plan_title": f"Lộ trình {goal} - {duration_days} ngày",
            "days": result_days
        }
        
        # Save to Database
        plan = WorkoutPlanModel(
            user_id=user_id,
            goal=goal,
            difficulty=difficulty,
            total_days=duration_days,
            preset_id=data.get('preset_id'),
            preset_title=data.get('preset_title'),
            preset_image=data.get('preset_image')
        )
        db.session.add(plan)
        db.session.flush() # get plan.id
        
        for day_data in result.get('days', []):
            day_num = day_data.get('day_number')
            daily = DailyWorkoutModel(
                plan_id=plan.id,
                day_number=day_num,
                title=day_data.get('title'),
                duration_minutes=day_data.get('duration_minutes', 20),
                calories=day_data.get('calories', 200),
                is_unlocked=(day_num == 1), # Only day 1 is unlocked initially
                exercises_data={"sections": day_data.get('sections', [])}
            )
            db.session.add(daily)
            
        db.session.commit()
        return jsonify({"success": True, "message": "Tạo lộ trình thành công", "plan_id": str(plan.id)}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        return jsonify({"success": False, "message": str(e)}), 500

@workout_bp.route('/plan/<plan_id>', methods=['DELETE'])
@jwt_required()
def delete_plan(plan_id):
    try:
        user_id = get_jwt_identity()
        plan = WorkoutPlanModel.query.filter_by(id=plan_id, user_id=user_id).first()
        if not plan:
            return jsonify({"status": "error", "message": "Không tìm thấy lộ trình"}), 404
            
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"status": "success", "message": "Xoá lộ trình thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@workout_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_plan():
    try:
        user_id = get_jwt_identity()
        plans = WorkoutPlanModel.query.filter_by(user_id=user_id).order_by(WorkoutPlanModel.created_at.desc()).all()
        if not plans:
            return jsonify({"success": True, "data": []}), 200
            
        return jsonify({"success": True, "data": [p.to_dict() for p in plans]}), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@workout_bp.route('/complete-day', methods=['POST'])
@jwt_required()
def complete_day():
    try:
        user_id = get_jwt_identity()
        data = request.json
        day_id = data.get('day_id')
        
        daily = DailyWorkoutModel.query.get(day_id)
        if not daily:
            return jsonify({"success": False, "message": "Không tìm thấy ngày tập"}), 404
            
        daily.is_completed = True
        daily.completed_at = datetime.utcnow()
        
        # Unlock next day
        next_day = DailyWorkoutModel.query.filter_by(plan_id=daily.plan_id, day_number=daily.day_number + 1).first()
        if next_day:
            next_day.is_unlocked = True
            
        db.session.commit()
        return jsonify({"success": True, "message": "Đã hoàn thành ngày tập"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@workout_bp.route('/save-progress', methods=['POST'])
@jwt_required()
def save_progress():
    try:
        user_id = get_jwt_identity()
        data = request.json
        day_id = data.get('day_id')
        progress_data = data.get('progress_data')
        
        daily = DailyWorkoutModel.query.get(day_id)
        if not daily:
            return jsonify({"success": False, "message": "Không tìm thấy ngày tập"}), 404
            
        # Ensure the daily workout belongs to the current user's plan
        plan = WorkoutPlanModel.query.get(daily.plan_id)
        if not plan or str(plan.user_id) != str(user_id):
            return jsonify({"success": False, "message": "Không có quyền truy cập"}), 403

        # Merge new progress data
        if not daily.progress_data:
            daily.progress_data = {}
        
        updated_progress = dict(daily.progress_data)
        updated_progress.update(progress_data)
        daily.progress_data = updated_progress
            
        db.session.commit()
        return jsonify({"success": True, "message": "Đã lưu tiến độ tập"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
