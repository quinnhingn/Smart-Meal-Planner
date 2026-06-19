import os
import random
from datetime import datetime, timedelta
import uuid

# Đặt đường dẫn để có thể import app
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.db import db
from model.auth.user_model import UserModel
from model.auth.user_profile_model import UserProfileModel
from model.auth.weight_log_model import WeightLogModel
from model.recipes.recipe_model import MealLogModel
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel

def seed_data():
    with app.app_context():
        user = UserModel.query.filter_by(email='test02@gmail.com').first()
        if not user:
            print("User test02@gmail.com not found!")
            return

        profile = UserProfileModel.query.filter_by(user_id=user.id).first()
        if not profile:
            print("User profile not found!")
            return

        target_calories = profile.target_calories or 2000
        target_weight = profile.target_weight_kg or 60
        current_weight = profile.weight_kg or 70

        print(f"Seeding data for {user.email} (Target Calories: {target_calories}, Current Weight: {current_weight}, Target Weight: {target_weight})")

        # Cleanup old fake data
        print("Cleaning up old mock data...")
        WeightLogModel.query.filter_by(user_id=user.id).delete()
        MealLogModel.query.filter_by(user_id=user.id).delete()
        
        # Cleanup old workouts
        plans = WorkoutPlanModel.query.filter_by(user_id=user.id).all()
        for plan in plans:
            DailyWorkoutModel.query.filter_by(plan_id=plan.id).delete()
            db.session.delete(plan)
        
        db.session.commit()

        # We will create a fake Workout Plan to attach daily workouts to
        fake_plan = WorkoutPlanModel(
            user_id=user.id,
            goal=profile.goal,
            difficulty="Dễ",
            total_days=30,
            preset_title="Giáo án mô phỏng 180 ngày"
        )
        db.session.add(fake_plan)
        db.session.commit()

        # Ngân muốn: Bơm data cho quá khứ (kết thúc ở HÔM QUA)
        # Để trống ngày hôm nay (hiện tại) để đi demo.
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        start_date = yesterday - timedelta(days=180)
        
        days_to_seed = 180
        weight_step = 5 / days_to_seed

        print(f"Bơm dữ liệu 180 ngày...")
        for i in range(days_to_seed, -1, -1):
            sim_date = datetime.combine(start_date + timedelta(days=i), datetime.min.time()) + timedelta(hours=8)
            
            # 1. Weight Log
            # Add some random noise to weight
            daily_weight = (current_weight + 5) - (days_to_seed - i) * weight_step + random.uniform(-0.5, 0.5)
            w_log = WeightLogModel(
                user_id=user.id,
                weight_kg=round(daily_weight, 1),
                logged_at=sim_date
            )
            db.session.add(w_log)

            # 2. Meal Logs (Sáng, Trưa, Tối, Phụ)
            # Tổng calo dao động quanh target_calories
            daily_calories = random.randint(int(target_calories * 0.8), int(target_calories * 1.1))
            meals = ['breakfast', 'lunch', 'dinner', 'snack']
            # Chia calo ra 4 bữa
            cal_parts = [0.25, 0.35, 0.30, 0.10]
            for j, m_type in enumerate(meals):
                meal_cal = daily_calories * cal_parts[j] * random.uniform(0.9, 1.1)
                m_log = MealLogModel(
                    id=str(uuid.uuid4()),
                    user_id=str(user.id),
                    recipe_id=None,
                    meal_name=f"Bữa {m_type} mô phỏng",
                    meal_type=m_type,
                    calories_consumed=round(meal_cal),
                    protein_g=round(meal_cal * 0.3 / 4),
                    carbs_g=round(meal_cal * 0.4 / 4),
                    fat_g=round(meal_cal * 0.3 / 9),
                    servings=1.0,
                    eaten_at=sim_date
                )
                db.session.add(m_log)

            # 3. Workout Logs (Tập 4-5 buổi 1 tuần)
            # 70% chance to workout
            if random.random() < 0.7:
                w_cal = random.randint(150, 400)
                dw_log = DailyWorkoutModel(
                    plan_id=fake_plan.id,
                    day_number=days_to_seed - i + 1,
                    is_completed=True,
                    calories=w_cal,
                    duration_minutes=random.randint(20, 60),
                    completed_at=sim_date
                )
                db.session.add(dw_log)

            # Commit batch every 30 days to avoid large transaction
            if i % 30 == 0:
                db.session.commit()

        db.session.commit()
        print("✅ Đã bơm dữ liệu thành công!")

if __name__ == "__main__":
    seed_data()
