import sys
import os

# Add backend to path
sys.path.append(os.path.abspath('backend'))

from flask import Flask
from database.db import db
from model.recipes.recipe_model import RecipeModel, DishCaloriesModel
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    recipe_count = RecipeModel.query.count()
    calories_count = DishCaloriesModel.query.count()
    print(f"Recipes count: {recipe_count}")
    print(f"Calories count: {calories_count}")
    
    if recipe_count > 0:
        r = RecipeModel.query.first()
        print(f"First recipe: {r.name_vn} (ID: {r.id})")
        if r.nutrition:
            print(f"Nutrition: {r.nutrition.to_dict()}")
        else:
            print("No nutrition found for first recipe")
