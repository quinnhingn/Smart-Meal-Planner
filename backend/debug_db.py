import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from flask import Flask
from database.db import db
from model.recipes.recipe_model import RecipeModel

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    recipes = RecipeModel.query.all()
    print("\n--- DANH SÁCH MÓN ĂN TRONG DB ---")
    for r in recipes:
        # In ra kèm dấu | để xem có khoảng trắng thừa không
        print(f"ID: {r.id} | Tên: |{r.name_vn}|")
    print("---------------------------------\n")
