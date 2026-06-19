import os
from app import app, db
from model.auth.user_model import UserModel
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
import uuid

with app.app_context():
    user = UserModel.query.filter_by(email="test02@gmail.com").first()
    if not user:
        print("User test02@gmail.com not found. Cannot seed.")
    else:
        # Check if plan already exists and delete
        existing_plan = WorkoutPlanModel.query.filter_by(user_id=user.id).first()
        if existing_plan:
            db.session.delete(existing_plan)
            db.session.commit()
            print("Deleted existing plan for user.")

        # Insert Mock Plan
        plan = WorkoutPlanModel(
            user_id=user.id,
            goal="Đốt mỡ siêu tốc",
            difficulty="Người mới",
            total_days=7
        )
        db.session.add(plan)
        db.session.flush()

        daily_workouts = [
            {
                "day_number": 1,
                "title": "Toàn thân năng động",
                "duration_minutes": 15,
                "calories": 150,
                "is_unlocked": True,
                "exercises_data": {
                    "sections": [
                        {
                            "id": "s1",
                            "title": "Phần 1: Khởi động",
                            "data": [
                                {
                                    "id": "e1",
                                    "name_vn": "Jumping Jacks",
                                    "duration_seconds": 60,
                                    "reps": None,
                                    "thumbnail": "https://img.youtube.com/vi/iSSAk4XCsZg/hqdefault.jpg",
                                    "videoUrl": "https://www.youtube.com/watch?v=iSSAk4XCsZg",
                                    "instructions": ["Đứng thẳng, tay để hai bên.", "Nhảy lên, dang rộng hai chân và tay.", "Nhảy trở lại tư thế ban đầu."],
                                    "tips": "Tiếp đất nhẹ nhàng bằng mũi chân."
                                }
                            ]
                        },
                        {
                            "id": "s2",
                            "title": "Phần 2: Tập chính",
                            "data": [
                                {
                                    "id": "e2",
                                    "name_vn": "Squats",
                                    "duration_seconds": 60,
                                    "reps": 15,
                                    "thumbnail": "https://img.youtube.com/vi/YaXPRqUwItQ/hqdefault.jpg",
                                    "videoUrl": "https://www.youtube.com/watch?v=YaXPRqUwItQ",
                                    "instructions": ["Đứng rộng bằng vai.", "Từ từ hạ hông xuống.", "Đẩy gót chân đứng lên."],
                                    "tips": "Giữ lưng thẳng."
                                },
                                {
                                    "id": "e3",
                                    "name_vn": "Push-ups (Chống đẩy)",
                                    "duration_seconds": 60,
                                    "reps": 10,
                                    "thumbnail": "https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg",
                                    "videoUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
                                    "instructions": ["Nằm sấp, tay chống ngang vai.", "Hạ ngực gần chạm sàn.", "Đẩy người lên."],
                                    "tips": "Nếu khó có thể hạ đầu gối."
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "day_number": 2,
                "title": "Bụng phẳng lỳ",
                "duration_minutes": 20,
                "calories": 200,
                "is_unlocked": False,
                "exercises_data": {
                    "sections": [
                        {
                            "id": "s1",
                            "title": "Phần 1: Bài tập Core",
                            "data": [
                                {
                                    "id": "e1",
                                    "name_vn": "Plank",
                                    "duration_seconds": 60,
                                    "reps": None,
                                    "thumbnail": "https://img.youtube.com/vi/pSHjTRCQxIw/hqdefault.jpg",
                                    "videoUrl": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
                                    "instructions": ["Chống khuỷu tay và mũi chân.", "Giữ thân hình thẳng."],
                                    "tips": "Gồng chặt cơ bụng."
                                }
                            ]
                        }
                    ]
                }
            }
        ]

        # Pad with empty days for 3..7
        for i in range(3, 8):
            daily_workouts.append({
                "day_number": i,
                "title": f"Ngày {i} Thử Thách",
                "duration_minutes": 20,
                "calories": 220,
                "is_unlocked": False,
                "exercises_data": {
                    "sections": [
                        {
                            "id": "s1",
                            "title": "Tập chính",
                            "data": [
                                {
                                    "id": "e1",
                                    "name_vn": "Nghỉ ngơi hoặc Cardio nhẹ nhàng",
                                    "duration_seconds": 600,
                                    "reps": None,
                                    "thumbnail": "https://img.youtube.com/vi/3d12z8P0a8U/hqdefault.jpg",
                                    "videoUrl": "https://www.youtube.com/watch?v=3d12z8P0a8U",
                                    "instructions": ["Hãy đi bộ nhẹ nhàng.", "Hít thở sâu."],
                                    "tips": "Thư giãn cơ bắp."
                                }
                            ]
                        }
                    ]
                }
            })

        for d in daily_workouts:
            daily = DailyWorkoutModel(
                plan_id=plan.id,
                day_number=d['day_number'],
                title=d['title'],
                duration_minutes=d['duration_minutes'],
                calories=d['calories'],
                is_unlocked=d['is_unlocked'],
                exercises_data={"sections": d['exercises_data']['sections']}
            )
            db.session.add(daily)

        db.session.commit()
        print("Successfully seeded 7-day workout plan for test02@gmail.com")
