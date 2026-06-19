from app import app
from database.db import db
from model.auth.user_model import UserModel
from flask_jwt_extended import create_access_token
import requests

with app.app_context():
    user = UserModel.query.filter_by(email='test02@gmail.com').first()
    token = create_access_token(identity=str(user.id))

headers = {"Authorization": f"Bearer {token}"}
r = requests.get("http://localhost:5001/api/workout/history", headers=headers)
print("Status Code:", r.status_code)
print("JSON:", r.json())
