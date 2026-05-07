from model.auth.user_profile_model import UserProfileModel
from database.db import db

class UserProfileRepository:
    def get_profile_by_user_id(self, user_id):
        return UserProfileModel.query.filter_by(user_id=user_id).first()

    def upsert_profile(self, user_id, profile_data):
        """Tạo mới hoặc cập nhật hồ sơ người dùng"""
        profile = self.get_profile_by_user_id(user_id)
        
        if not profile:
            profile = UserProfileModel(user_id=user_id)
            db.session.add(profile)
        
        # Mapping dữ liệu từ frontend gửi lên vào database
        # Lưu ý: Các key này phải khớp với payload từ OnboardingScreen gửi lên
        profile.gender = profile_data.get('gender')
        profile.age = int(profile_data.get('age', 0))
        profile.height_cm = float(profile_data.get('height', 0))
        profile.weight_kg = float(profile_data.get('weight', 0))
        profile.target_weight_kg = float(profile_data.get('targetWeight', 0))
        
        # Chuyển đổi activity string thành float (theo calculator.js)
        activity_map = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        }
        profile.activity_level = activity_map.get(profile_data.get('activity'), 1.2)
        
        profile.goal = profile_data.get('goal')
        profile.body_type = profile_data.get('bodyType')
        profile.pace = profile_data.get('pace')
        profile.dietary_preference = profile_data.get('diet')
        profile.allergies = profile_data.get('allergies', [])
        profile.dislikes = profile_data.get('dislikes', [])
        
        # Các chỉ số tính toán
        profile.bmi = float(profile_data.get('bmi', 0))
        profile.tdee = float(profile_data.get('tdee', 0))
        profile.target_calories = int(profile_data.get('target_calories', 0))
        profile.target_protein_g = float(profile_data.get('protein_g', 0))
        profile.target_carbs_g = float(profile_data.get('carbs_g', 0))
        profile.target_fat_g = float(profile_data.get('fat_g', 0))
        profile.estimated_weeks = int(profile_data.get('estimatedWeeks', 0))
        
        db.session.commit()
        return profile
