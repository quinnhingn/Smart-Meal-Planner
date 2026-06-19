import os
import sys
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
from model.auth.user_profile_model import UserProfileModel

with app.app_context():
    print("Mocking demo data...")
    user = UserProfileModel.query.first()
    if not user:
        print("No user found in DB!")
        sys.exit(1)
        
    user_id = user.user_id
    
    # -------------------------------------------------------------
    # P4: Đã tập được 2 ngày
    # -------------------------------------------------------------
    plan_p4 = WorkoutPlanModel(
        user_id=user_id,
        goal="Giảm mỡ",
        difficulty="Trung bình",
        total_days=7,
        preset_id="p4",
        preset_title="Pilates Đốt Mỡ Thon Gọn",
        preset_image="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.session.add(plan_p4)
    db.session.flush()
    
    for i in range(1, 8):
        is_unlocked = i <= 3
        is_completed = i <= 2
        completed_at = datetime.utcnow() - timedelta(days=3-i) if is_completed else None
        
        daily = DailyWorkoutModel(
            plan_id=plan_p4.id,
            day_number=i,
            title=f"Ngày {i}: Pilates Day {i}",
            duration_minutes=30,
            calories=250,
            is_unlocked=is_unlocked,
            is_completed=is_completed,
            completed_at=completed_at,
            exercises_data={"sections": []}
        )
        db.session.add(daily)
        
    # -------------------------------------------------------------
    # P5: Đang tập dở (progress_data)
    # -------------------------------------------------------------
    plan_p5 = WorkoutPlanModel(
        user_id=user_id,
        goal="Tăng thể lực",
        difficulty="Nâng cao",
        total_days=7,
        preset_id="p5",
        preset_title="Thử thách Cardio 7 Ngày",
        preset_image="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80",
        created_at=datetime.utcnow()
    )
    db.session.add(plan_p5)
    db.session.flush()
    
    for i in range(1, 8):
        daily = DailyWorkoutModel(
            plan_id=plan_p5.id,
            day_number=i,
            title=f"Ngày {i}: Cardio Day {i}",
            duration_minutes=45,
            calories=400,
            is_unlocked=(i == 1),
            is_completed=False,
            progress_data={"currentExerciseIndex": 1} if i == 1 else None,
            exercises_data={"sections": [{"data": [{}, {}, {}]}]} # dummy data for progress calculation
        )
        db.session.add(daily)

    db.session.commit()
    print("Added mock data successfully!")
