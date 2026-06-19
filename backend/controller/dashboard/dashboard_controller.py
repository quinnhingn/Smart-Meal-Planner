from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from model.auth.user_model import UserModel
from model.auth.user_profile_model import UserProfileModel
from model.auth.weight_log_model import WeightLogModel
from model.recipes.recipe_model import MealLogModel
from model.workout.workout_plan_model import WorkoutPlanModel, DailyWorkoutModel
from sqlalchemy import func
from datetime import datetime, timedelta
import pytz

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/tracking', methods=['GET'])
@jwt_required()
def get_tracking():
    try:
        user_id = get_jwt_identity()
        time_range = request.args.get('timeRange', '1w') # '1w', '1m', '3m', '6m'
        
        limit_map = {
            '1w': 7,
            '1m': 30,
            '3m': 90,
            '6m': 180
        }
        days_limit = limit_map.get(time_range, 7)
        
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now_vn = datetime.now(vn_tz)
        start_date = (now_vn - timedelta(days=days_limit)).replace(hour=0, minute=0, second=0, microsecond=0)

        # Trả về các ngày trong khoảng
        # Khởi tạo data_map rỗng cho mỗi ngày
        data_map = {}
        for i in range(days_limit):
            d = (start_date + timedelta(days=i+1)).date()
            data_map[str(d)] = {
                "date": str(d),
                "calo": 0,
                "weight": None, # Sẽ được điền
                "isCheckInDay": False
            }

        # Lấy lịch sử Cân nặng
        weight_logs = db.session.query(
            func.date(func.timezone('Asia/Ho_Chi_Minh', WeightLogModel.logged_at)).label('log_date'),
            func.avg(WeightLogModel.weight_kg).label('avg_weight')
        ).filter(
            WeightLogModel.user_id == user_id,
            func.timezone('Asia/Ho_Chi_Minh', WeightLogModel.logged_at) >= start_date
        ).group_by(db.text('log_date')).all()

        for w in weight_logs:
            d_str = str(w.log_date)
            if d_str in data_map:
                data_map[d_str]["weight"] = float(w.avg_weight)
                data_map[d_str]["isCheckInDay"] = True

        # Điền các ngày không check-in weight bằng cân nặng gần nhất
        last_weight = None
        for i in range(days_limit):
            d_str = str((start_date + timedelta(days=i+1)).date())
            if data_map[d_str]["weight"] is not None:
                last_weight = data_map[d_str]["weight"]
            elif last_weight is not None:
                data_map[d_str]["weight"] = last_weight

        # Lấy tổng calo đã nạp
        meal_logs = db.session.query(
            func.date(func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at)).label('log_date'),
            func.sum(MealLogModel.calories_consumed).label('total_cal')
        ).filter(
            MealLogModel.user_id == user_id,
            func.timezone('Asia/Ho_Chi_Minh', MealLogModel.eaten_at) >= start_date
        ).group_by(db.text('log_date')).all()

        for m in meal_logs:
            d_str = str(m.log_date)
            if d_str in data_map:
                data_map[d_str]["calo"] += int(m.total_cal)

        # Lấy Profile
        profile = UserProfileModel.query.filter_by(user_id=user_id).first()
        target_calories = profile.target_calories if profile else 2000
        target_weight = profile.target_weight_kg if profile else 60

        # Sắp xếp thành mảng
        sorted_keys = sorted(data_map.keys())
        result_data = [data_map[k] for k in sorted_keys]

        # Fix if last_weight was entirely None because no checkins at all in this period
        if result_data and result_data[0]["weight"] is None:
            w_fallback = profile.weight_kg if profile else 65
            for row in result_data:
                if row["weight"] is None:
                    row["weight"] = w_fallback

        return jsonify({
            "success": True,
            "data": {
                "trackingData": result_data,
                "profileStats": {
                    "targetWeight": target_weight,
                    "targetCalories": target_calories
                }
            }
        })
    except Exception as e:
        print(f"Tracking API Error: {e}")
        return jsonify({"success": False, "message": "Server error", "error": str(e)}), 500
