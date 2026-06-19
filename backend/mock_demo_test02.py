import os
import sys
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
import sqlalchemy

with app.app_context():
    print("Mocking demo data specifically for test02...")
    
    # Use raw SQL to find the user to avoid SQLAlchemy metadata conflicts
    res = db.session.execute(sqlalchemy.text("SELECT id FROM scr_users WHERE email LIKE '%test02%' LIMIT 1;"))
    row = res.fetchone()
    
    if not row:
        print("No test02 user found in DB! Trying first user...")
        res = db.session.execute(sqlalchemy.text("SELECT id FROM scr_users LIMIT 1;"))
        row = res.fetchone()
        if not row:
            print("No users at all!")
            sys.exit(1)
            
    user_id = row[0]
    print(f"Injecting for user_id: {user_id}")
    
    # Check if they already have p4 or p5 to avoid duplicates
    existing_p4 = WorkoutPlanModel.query.filter_by(user_id=user_id, preset_id="p4").first()
    if existing_p4:
        db.session.delete(existing_p4)
    existing_p5 = WorkoutPlanModel.query.filter_by(user_id=user_id, preset_id="p5").first()
    if existing_p5:
        db.session.delete(existing_p5)
    db.session.commit()
    
    # Dummy exercises data structure so the UI calculates progress accurately
    dummy_exercises_data = {
        "sections": [
            {
                "data": [
                    {"id": "e1", "name": "Ex 1"},
                    {"id": "e2", "name": "Ex 2"},
                    {"id": "e3", "name": "Ex 3"}
                ]
            }
        ]
    }
    
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
            title=f"Ngày {i}: Tinh thần Pilates",
            duration_minutes=30,
            calories=250,
            is_unlocked=is_unlocked,
            is_completed=is_completed,
            completed_at=completed_at,
            exercises_data=dummy_exercises_data
        )
        db.session.add(daily)
        
    # -------------------------------------------------------------
    # P5: Đang tập dở (progress_data) ở ngày 1
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
            title=f"Ngày {i}: Cardio Đốt Mỡ",
            duration_minutes=45,
            calories=400,
            is_unlocked=(i == 1),
            is_completed=False,
            progress_data={"currentExerciseIndex": 1} if i == 1 else None, # completed 1 of 3 (so next is index 1 => "Đang tập dở Bài 2")
            exercises_data=dummy_exercises_data
        )
        db.session.add(daily)

    db.session.commit()
    print("Added mock data specifically for test02 successfully!")
