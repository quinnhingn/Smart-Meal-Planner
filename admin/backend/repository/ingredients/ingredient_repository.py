from model.ingredients.ingredient_model import IngredientModel
from database.db import db
from typing import List, Optional
from sqlalchemy.orm import joinedload

class IngredientRepository:
    def get_all(self) -> List[IngredientModel]:
        return IngredientModel.query.options(joinedload(IngredientModel.creator)).order_by(IngredientModel.created_at.desc()).all()

    def get_by_id(self, ingredient_id: int) -> Optional[IngredientModel]:
        return IngredientModel.query.get(ingredient_id)

    def create(self, ingredient_data: dict) -> IngredientModel:
        new_ingredient = IngredientModel(**ingredient_data)
        db.session.add(new_ingredient)
        db.session.commit()
        return new_ingredient

    def update(self, ingredient_id: int, update_data: dict) -> Optional[IngredientModel]:
        ingredient = self.get_by_id(ingredient_id)
        if not ingredient:
            return None
        
        for key, value in update_data.items():
            setattr(ingredient, key, value)
            
        db.session.commit()
        return ingredient

    def delete(self, ingredient_id: int) -> bool:
        ingredient = self.get_by_id(ingredient_id)
        if not ingredient:
            return False
            
        db.session.delete(ingredient)
        db.session.commit()
        return True
