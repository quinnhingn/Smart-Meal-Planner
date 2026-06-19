from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from repository.recipes.recommendation_repository import RecommendationRepository

recommendation_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@recommendation_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        user_id = get_jwt_identity()
        meal_type = request.args.get('meal_type', 'dinner')
        
        result = RecommendationRepository.get_macro_recommendations(user_id, meal_type)
        if result.get("status") == "error":
            return jsonify({"success": False, "message": result.get("message")}), 400
            
        return jsonify({
            "success": True,
            "message": result.get("message", ""),
            "data": result.get("data", [])
        }), 200
    except Exception as e:
        print(f"❌ [Get Recommendations] Error: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi lấy gợi ý: {str(e)}"}), 500

@recommendation_bp.route('/<recipe_id>/explain', methods=['GET'])
@jwt_required()
def explain_recommendation(recipe_id):
    try:
        user_id = get_jwt_identity()
        meal_type = request.args.get('meal_type', 'dinner')
        
        result = RecommendationRepository.explain_recommendation(user_id, recipe_id, meal_type)
        if result.get("status") == "error":
            return jsonify({"success": False, "message": result.get("message")}), 400
            
        return jsonify({
            "success": True,
            "data": result.get("data")
        }), 200
    except Exception as e:
        print(f"❌ [Explain Recommendation] Error: {str(e)}")
        return jsonify({"success": False, "message": f"Lỗi giải thích gợi ý: {str(e)}"}), 500
