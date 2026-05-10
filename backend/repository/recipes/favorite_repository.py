from database.db import db
from model.recipes.favorite_model import FavoriteRecipeModel

class FavoriteRepository:
    @staticmethod
    def toggle_favorite(user_id, recipe_id):
        try:
            # Kiểm tra xem đã có trong danh sách yêu thích chưa
            existing = FavoriteRecipeModel.query.filter_by(
                user_id=user_id, 
                recipe_id=recipe_id
            ).first()

            if existing:
                # Nếu có rồi thì xóa (Unfavorite)
                db.session.delete(existing)
                db.session.commit()
                return {"status": "removed", "success": True}
            else:
                # Nếu chưa có thì thêm mới (Favorite)
                new_fav = FavoriteRecipeModel(user_id=user_id, recipe_id=recipe_id)
                db.session.add(new_fav)
                db.session.commit()
                return {"status": "added", "success": True}
        except Exception as e:
            db.session.rollback()
            print(f"❌ [Favorite Error] {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def get_user_favorite_ids(user_id):
        try:
            favs = FavoriteRecipeModel.query.filter_by(user_id=user_id).all()
            return [f.recipe_id for f in favs]
        except Exception as e:
            print(f"❌ [Get Favorites Error] {e}")
            return []
