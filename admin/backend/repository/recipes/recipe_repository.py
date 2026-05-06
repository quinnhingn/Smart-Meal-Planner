from database.db import db
from sqlalchemy import text
import json

class RecipeRepository:
    def create(self, data):
        """
        Tạo mới một công thức nấu ăn vào bảng scr_recipes
        """
        try:
            sql = text("""
                INSERT INTO scr_recipes (
                    name_vn, name_en, category, difficulty, cooking_time, servings,
                    image_url, video_url, goals, meal_times, ingredients, steps,
                    total_calories, total_protein, total_carbs, total_fat,
                    ai_insight, created_by
                ) VALUES (
                    :name_vn, :name_en, :category, :difficulty, :cooking_time, :servings,
                    :image_url, :video_url, :goals, :meal_times, :ingredients, :steps,
                    :total_calories, :total_protein, :total_carbs, :total_fat,
                    :ai_insight, :created_by
                ) RETURNING id
            """)
            
            # Chuyển đổi list/dict sang JSON string cho PostgreSQL JSONB
            params = {
                "name_vn": data.get("name_vn"),
                "name_en": data.get("name_en"),
                "category": data.get("category"),
                "difficulty": data.get("difficulty"),
                "cooking_time": data.get("cooking_time"),
                "servings": data.get("servings"),
                "image_url": data.get("image_url"),
                "video_url": data.get("video_url"),
                "goals": json.dumps(data.get("goals", [])),
                "meal_times": json.dumps(data.get("meal_times", [])),
                "ingredients": json.dumps(data.get("ingredients", [])),
                "steps": json.dumps(data.get("steps", [])),
                "total_calories": data.get("total_calories", 0),
                "total_protein": data.get("total_protein", 0),
                "total_carbs": data.get("total_carbs", 0),
                "total_fat": data.get("total_fat", 0),
                "ai_insight": data.get("ai_insight"),
                "created_by": data.get("created_by")
            }
            
            result = db.session.execute(sql, params)
            recipe_id = result.fetchone()[0]
            db.session.commit()
            
            return {"success": True, "recipe_id": recipe_id}
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    def get_by_id(self, recipe_id):
        """Lấy chi tiết một công thức theo ID"""
        try:
            sql = text("SELECT * FROM scr_recipes WHERE id = :id")
            result = db.session.execute(sql, {"id": recipe_id})
            row = result.fetchone()
            if row:
                return {"success": True, "data": dict(row._mapping)}
            return {"success": False, "message": "Không tìm thấy công thức"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def get_all(self):
        """Lấy danh sách tất cả công thức"""
        try:
            sql = text("SELECT * FROM scr_recipes ORDER BY created_at DESC")
            result = db.session.execute(sql)
            recipes = [dict(row._mapping) for row in result]
            return {"success": True, "data": recipes}
        except Exception as e:
            return {"success": False, "message": str(e)}
