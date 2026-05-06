from repository.auth.user_profile_repository import UserProfileRepository

class UserProfileHandler:
    def __init__(self):
        self.profile_repo = UserProfileRepository()

    def update_user_profile(self, user_id, profile_data):
        try:
            profile = self.profile_repo.upsert_profile(user_id, profile_data)
            return {
                "success": True,
                "message": "Cập nhật hồ sơ thành công!",
                "data": profile.to_dict(),
                "status_code": 200
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Lỗi lưu hồ sơ: {str(e)}",
                "status_code": 500
            }

    def get_user_profile(self, user_id):
        profile = self.profile_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {
                "success": False,
                "message": "Không tìm thấy hồ sơ",
                "status_code": 404
            }
        return {
            "success": True,
            "data": profile.to_dict(),
            "status_code": 200
        }
