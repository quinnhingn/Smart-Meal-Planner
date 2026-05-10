from database.db import db
from model.recipes.review_model import ReviewModel
from sqlalchemy import func

class ReviewRepository:
    @staticmethod
    def add_review(user_id, recipe_id, rating, comment, tags=None, images=None):
        try:
            # Kiểm tra xem người dùng đã đánh giá món này chưa
            existing = ReviewModel.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
            if existing:
                # Cập nhật đánh giá cũ
                existing.rating = rating
                existing.comment = comment
                existing.tags = tags or []
                existing.images = images or []
                existing.created_at = db.func.now()
            else:
                # Thêm mới
                new_review = ReviewModel(
                    user_id=user_id,
                    recipe_id=recipe_id,
                    rating=rating,
                    comment=comment,
                    tags=tags or [],
                    images=images or []
                )
                db.session.add(new_review)
            
            db.session.commit()
            return {"success": True, "message": "Đã lưu đánh giá"}
        except Exception as e:
            db.session.rollback()
            print(f"❌ [Add Review Error] {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def get_reviews_for_recipe(recipe_id):
        try:
            from model.auth.user_model import UserModel
            # Join với bảng người dùng để lấy tên
            results = db.session.query(ReviewModel, UserModel.name).\
                join(UserModel, ReviewModel.user_id == UserModel.id).\
                filter(ReviewModel.recipe_id == recipe_id).\
                order_by(ReviewModel.created_at.desc()).all()
            
            data = []
            for review, user_name in results:
                d = review.to_dict()
                d['userName'] = user_name
                data.append(d)
            return data
        except Exception as e:
            print(f"❌ [Get Reviews Error] {e}")
            return []

    @staticmethod
    def get_recipe_stats(recipe_id):
        try:
            stats = db.session.query(
                func.avg(ReviewModel.rating).label('avg_rating'),
                func.count(ReviewModel.id).label('total_reviews')
            ).filter(ReviewModel.recipe_id == recipe_id).first()
            
            return {
                "avgRating": round(float(stats.avg_rating or 5.0), 1),
                "total": int(stats.total_reviews or 0)
            }
        except Exception as e:
            print(f"❌ [Get Stats Error] {e}")
            return {"avgRating": 5.0, "total": 0}
