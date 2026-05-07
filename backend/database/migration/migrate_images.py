import os
import cloudinary
import cloudinary.uploader
from app import app
from backend.database.db import db
from backend.model.ingredients.ingredient_model import IngredientModel
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Cấu hình Cloudinary
cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

def migrate():
    with app.app_context():
        print("🔍 Đang tìm các nguyên liệu sử dụng ảnh Local trên USB...")
        # Tìm các nguyên liệu có link chứa '/uploads/'
        ingredients = IngredientModel.query.filter(IngredientModel.image_url.like('%/uploads/%')).all()
        
        if not ingredients:
            print("✅ Không tìm thấy ảnh local nào cần chuyển đổi.")
            return

        print(f"📦 Tìm thấy {len(ingredients)} nguyên liệu cần 'lên mây'. Đang bắt đầu...")
        
        # Thư mục chứa ảnh local
        upload_dir = os.path.abspath(os.path.join(os.getcwd(), 'uploads'))

        success_count = 0
        for ing in ingredients:
            try:
                # Lấy tên file từ URL cũ (VD: http://localhost:5000/uploads/abc.png -> abc.png)
                filename = ing.image_url.split('/')[-1]
                local_path = os.path.join(upload_dir, filename)
                
                if os.path.exists(local_path):
                    print(f"📤 Đang đẩy lên Cloudinary: {ing.name_vn} ({filename})")
                    upload_result = cloudinary.uploader.upload(
                        local_path, 
                        folder="ingredients_migration",
                        public_id=f"migrated_{filename.split('.')[0]}"
                    )
                    
                    # Cập nhật link mới vào DB
                    ing.image_url = upload_result.get("secure_url")
                    db.session.commit()
                    success_count += 1
                    print(f"✅ Thành công: {ing.name_vn}")
                else:
                    print(f"⚠️ Cảnh báo: Không tìm thấy file vật lý cho {ing.name_vn} tại {local_path}")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Lỗi khi xử lý {ing.name_vn}: {str(e)}")

        print(f"\n✨ HOÀN THÀNH! Đã chuyển đổi thành công {success_count}/{len(ingredients)} ảnh lên Cloudinary.")

if __name__ == "__main__":
    migrate()
