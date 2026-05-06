import os
import uuid
import requests
from io import BytesIO
from PIL import Image
from rembg import remove
import cloudinary
import cloudinary.uploader
from repository.recipes.recipe_repository import RecipeRepository

class RecipeHandler:
    def __init__(self):
        self.recipe_repo = RecipeRepository()
        
        # Cấu hình Cloudinary
        cloudinary.config(
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key = os.getenv("CLOUDINARY_API_KEY"),
            api_secret = os.getenv("CLOUDINARY_API_SECRET"),
            secure = True
        )

    def process_image_and_upload(self, image_source):
        """
        Tách nền ảnh và tải lên Cloudinary
        image_source có thể là URL hoặc Base64
        """
        try:
            input_image = None
            
            # 1. Xử lý Base64
            if image_source.startswith("data:image"):
                import base64
                header, encoded = image_source.split(",", 1)
                image_data = base64.b64decode(encoded)
                input_image = Image.open(BytesIO(image_data))
            
            # 2. Xử lý URL
            else:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                response = requests.get(image_source, headers=headers, timeout=10)
                if response.status_code == 200:
                    input_image = Image.open(BytesIO(response.content))

            if not input_image:
                return None

            # 3. Chuyển đổi mode nếu cần
            if input_image.mode != 'RGB' and input_image.mode != 'RGBA':
                input_image = input_image.convert('RGB')

            # 4. Tách nền bằng AI (rembg)
            output_image = remove(input_image)

            # 5. Lưu tạm và upload lên Cloudinary
            img_byte_arr = BytesIO()
            output_image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            upload_result = cloudinary.uploader.upload(
                img_byte_arr, 
                folder="recipes_nobg",
                public_id=f"recipe_{uuid.uuid4()}"
            )
            
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"❌ Lỗi xử lý ảnh: {str(e)}")
            return None

    def create_recipe(self, data, admin_id):
        """
        Luồng xử lý lưu công thức
        """
        try:
            # 1. Xử lý ảnh nếu có
            image_url = data.get("imageUrl") or data.get("image_url")
            if image_url and (image_url.startswith("data:") or "http" in image_url):
                # Chỉ xử lý nếu là ảnh mới (base64 hoặc url ngoài), 
                # không xử lý nếu đã là link cloudinary cũ
                if "cloudinary.com" not in image_url:
                    processed_url = self.process_image_and_upload(image_url)
                    if processed_url:
                        # Lưu lại link mới vào data để bước sau lấy ra
                        data["imageUrl"] = processed_url
                        data["image_url"] = processed_url

            # 2. Chuẩn bị dữ liệu để lưu vào Repo
            recipe_data = {
                "name_vn": data.get("name"),
                "name_en": data.get("name_en", ""),
                "category": data.get("category"),
                "difficulty": data.get("difficulty"),
                "cooking_time": data.get("cookingTime"),
                "servings": data.get("servings"),
                "image_url": data.get("imageUrl") or data.get("image_url"), # Kiểm tra cả 2 kiểu đặt tên
                "video_url": data.get("videoUrl") or data.get("video_url"),
                "goals": data.get("goals", []),
                "meal_times": data.get("mealTimes", []),
                "ingredients": data.get("ingredients", []),
                "steps": data.get("steps", []),
                "total_calories": data.get("total_calories", 0),
                "total_protein": data.get("total_protein", 0),
                "total_carbs": data.get("total_carbs", 0),
                "total_fat": data.get("total_fat", 0),
                "ai_insight": data.get("ai_insight", ""),
                "created_by": admin_id
            }

            # 3. Gọi Repo lưu vào DB
            result = self.recipe_repo.create(recipe_data)
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": "Lưu công thức thành công!",
                    "recipe_id": result.get("recipe_id")
                }
            else:
                return {
                    "success": False,
                    "message": f"Lỗi lưu DB: {result.get('message')}"
                }

        except Exception as e:
            import traceback
            print(f"💥 [ERROR] Lỗi tại RecipeHandler.create_recipe: {str(e)}")
            traceback.print_exc()
            return {
                "success": False,
                "message": f"Lỗi xử lý Handler: {str(e)}"
            }

    def update_recipe(self, recipe_id, data):
        """
        Luồng xử lý cập nhật công thức
        """
        try:
            # 1. Xử lý ảnh nếu có
            image_url = data.get("imageUrl") or data.get("image_url")
            if image_url and (image_url.startswith("data:") or ("http" in image_url and "cloudinary.com" not in image_url)):
                processed_url = self.process_image_and_upload(image_url)
                if processed_url:
                    data["imageUrl"] = processed_url
                    data["image_url"] = processed_url

            # 2. Chuẩn bị dữ liệu để lưu vào Repo
            recipe_data = {
                "name_vn": data.get("name"),
                "name_en": data.get("name_en", ""),
                "category": data.get("category"),
                "difficulty": data.get("difficulty"),
                "cooking_time": data.get("cookingTime"),
                "servings": data.get("servings"),
                "image_url": data.get("imageUrl") or data.get("image_url"),
                "video_url": data.get("videoUrl") or data.get("video_url"),
                "goals": data.get("goals", []),
                "meal_times": data.get("mealTimes", []),
                "ingredients": data.get("ingredients", []),
                "steps": data.get("steps", []),
                "total_calories": data.get("total_calories", 0),
                "total_protein": data.get("total_protein", 0),
                "total_carbs": data.get("total_carbs", 0),
                "total_fat": data.get("total_fat", 0),
                "ai_insight": data.get("ai_insight", "")
            }

            # 3. Gọi Repo cập nhật DB
            result = self.recipe_repo.update(recipe_id, recipe_data)
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": "Cập nhật công thức thành công!"
                }
            else:
                return {
                    "success": False,
                    "message": f"Lỗi lưu DB: {result.get('message')}"
                }

        except Exception as e:
            import traceback
            print(f"💥 [ERROR] Lỗi tại RecipeHandler.update_recipe: {str(e)}")
            traceback.print_exc()
            return {
                "success": False,
                "message": f"Lỗi xử lý Handler: {str(e)}"
            }

    def get_recipe_by_id(self, recipe_id):
        """
        Lấy chi tiết một công thức và parse dữ liệu JSON
        """
        try:
            result = self.recipe_repo.get_by_id(recipe_id)
            if result["success"]:
                data = result["data"]
                # Parse các trường JSONB
                import json
                for field in ["goals", "meal_times", "ingredients", "steps"]:
                    if data.get(field) and isinstance(data.get(field), str):
                        try:
                            data[field] = json.loads(data[field])
                        except:
                            pass
                return {"success": True, "data": data}
            return result
        except Exception as e:
            return {"success": False, "message": str(e)}

    def get_all_recipes(self):
        return self.recipe_repo.get_all()
