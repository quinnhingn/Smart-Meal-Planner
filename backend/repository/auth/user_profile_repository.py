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
        # Đã khớp 100% theo các key được trả ra từ OnboardingScreen.js
        profile.gender = profile_data.get('gender')
        profile.age = int(profile_data.get('age', 0))
        profile.height_cm = float(profile_data.get('height_cm', 0))
        profile.weight_kg = float(profile_data.get('weight_kg', 0))
        profile.target_weight_kg = float(profile_data.get('target_weight_kg', 0))
        
        # Chuyển đổi activity string thành float chuẩn V2
        activity_map = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        profile.activity_level = activity_map.get(profile_data.get('activity_level'), 1.2)
        
        profile.goal = profile_data.get('goal')
        # Frontend gửi 'speed', BE lưu vào 'pace'
        profile.pace = profile_data.get('speed')
        # Frontend gửi 'diet', BE lưu vào 'dietary_preference'
        profile.dietary_preference = profile_data.get('diet')
        profile.allergies = profile_data.get('allergies', [])
        profile.dislikes = profile_data.get('dislikes', [])
        
        # Các chỉ số tính toán
        height_m = profile.height_cm / 100
        if height_m > 0 and profile.weight_kg > 0:
            profile.bmi = round(profile.weight_kg / (height_m * height_m), 1)
            
        profile.tdee = float(profile_data.get('tdee', 0))
        profile.target_calories = int(profile_data.get('target_calories', 0))
        profile.target_protein_g = float(profile_data.get('target_protein_g', 0))
        profile.target_carbs_g = float(profile_data.get('target_carbs_g', 0))
        profile.target_fat_g = float(profile_data.get('target_fat_g', 0))
        # Frontend gửi 'expectedWeeks', BE lưu vào 'estimated_weeks'
        profile.estimated_weeks = int(profile_data.get('expectedWeeks', 0))
        
        db.session.commit()
        return profile
