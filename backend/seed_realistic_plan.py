from database.db import db
from app import app
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

with app.app_context():
    existing_user_id = None
    existing_plan = WorkoutPlanModel.query.first()
    if existing_plan:
        existing_user_id = existing_plan.user_id
    else:
        existing_user_id = "test_user_id" # Fallback if no user
        
    print(f"Creating realistic plan for user: {existing_user_id}")
    
    # 1. Create a new plan
    new_plan = WorkoutPlanModel(
        user_id=existing_user_id,
        goal="Tăng cơ bụng & Giảm mỡ eo",
        difficulty="Trung bình",
        total_days=7
    )
    db.session.add(new_plan)
    db.session.flush()
    
    # 2. Daily Data
    days_data = [
        {
            "day_number": 1,
            "title": "Kích hoạt cơ bụng trên",
            "duration": 15,
            "calories": 120,
            "is_unlocked": True,
            "is_completed": True,
            "exercises": {
                "sections": [
                    {
                        "title": "Khởi động",
                        "data": [
                            {
                                "name": "Jumping Jacks",
                                "reps_or_duration": "30s",
                                "met_value": 8.0,
                                "duration_seconds": 30,
                                "video_id": "iSSAk4XCsZg",
                                "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"
                            }
                        ]
                    },
                    {
                        "title": "Bài tập chính",
                        "data": [
                            {
                                "name": "Crunches (Gập bụng)",
                                "reps_or_duration": "20 reps",
                                "met_value": 4.0,
                                "duration_seconds": 60,
                                "video_id": "Xyd_fa5zoEU",
                                "thumbnail": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"
                            },
                            {
                                "name": "Leg Raises (Nâng chân)",
                                "reps_or_duration": "15 reps",
                                "met_value": 4.5,
                                "duration_seconds": 60,
                                "video_id": "l4kQd9eFSbc",
                                "thumbnail": "https://images.unsplash.com/photo-1599058917206-d00742d4a5da?w=400&q=80"
                            },
                            {
                                "name": "Plank",
                                "reps_or_duration": "45s",
                                "met_value": 5.0,
                                "duration_seconds": 45,
                                "video_id": "pSHjTRCQxIw",
                                "thumbnail": "https://images.unsplash.com/photo-1566241440091-ec10de8d6111?w=400&q=80"
                            }
                        ]
                    },
                    {
                        "title": "Giãn cơ",
                        "data": [
                            {
                                "name": "Cobra Stretch",
                                "reps_or_duration": "30s",
                                "met_value": 2.5,
                                "duration_seconds": 30,
                                "video_id": "z21B_JpP0rQ",
                                "thumbnail": "https://images.unsplash.com/photo-1552286450-4a669f880062?w=400&q=80"
                            }
                        ]
                    }
                ]
            }
        },
        {
            "day_number": 2,
            "title": "Đốt mỡ liên sườn (V-cut)",
            "duration": 18,
            "calories": 160,
            "is_unlocked": True,
            "is_completed": False,
            "exercises": {
                "sections": [
                    {
                        "title": "Khởi động",
                        "data": [
                            {
                                "name": "High Knees",
                                "reps_or_duration": "45s",
                                "met_value": 8.0,
                                "duration_seconds": 45,
                                "video_id": "ZNDnZOUXIgM",
                                "thumbnail": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"
                            }
                        ]
                    },
                    {
                        "title": "Bài tập chính",
                        "data": [
                            {
                                "name": "Russian Twist",
                                "reps_or_duration": "30 reps",
                                "met_value": 5.0,
                                "duration_seconds": 60,
                                "video_id": "wkD8rjkodUI",
                                "thumbnail": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80"
                            },
                            {
                                "name": "Bicycle Crunches",
                                "reps_or_duration": "30 reps",
                                "met_value": 6.0,
                                "duration_seconds": 60,
                                "video_id": "9FGilxCbdz8",
                                "thumbnail": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80"
                            },
                            {
                                "name": "Side Plank (Left/Right)",
                                "reps_or_duration": "30s / side",
                                "met_value": 4.0,
                                "duration_seconds": 60,
                                "video_id": "NIfbFwWJ0-o",
                                "thumbnail": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80"
                            }
                        ]
                    }
                ]
            }
        }
    ]
    
    # Fill remaining days
    for i in range(3, 8):
        days_data.append({
            "day_number": i,
            "title": f"Lõi (Core) sức mạnh - Phần {i}",
            "duration": 20,
            "calories": 180,
            "is_unlocked": False,
            "is_completed": False,
            "exercises": {
                "sections": [
                    {
                        "title": "Bài tập chính",
                        "data": [
                            {
                                "name": "Burpees",
                                "reps_or_duration": "15 reps",
                                "met_value": 10.0,
                                "duration_seconds": 60,
                                "video_id": "dZgVxj6Bc_E",
                                "thumbnail": "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&q=80"
                            }
                        ]
                    }
                ]
            }
        })

    for d in days_data:
        day_model = DailyWorkoutModel(
            plan_id=new_plan.id,
            day_number=d["day_number"],
            is_unlocked=d["is_unlocked"],
            is_completed=d["is_completed"],
            title=d["title"],
            duration_minutes=d["duration"],
            calories=d["calories"],
            exercises_data=d["exercises"]
        )
        db.session.add(day_model)
        
    db.session.commit()
    print("Seeded realistic plan data successfully!")
