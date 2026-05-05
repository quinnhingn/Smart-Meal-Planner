from app import app
from database.db import db
from sqlalchemy import text

def upgrade():
    with app.app_context():
        print("🛠️  Đang nâng cấp Database: Thêm cột 'unit_conversions' và 'substitutions'...")
        try:
            # PostgreSQL command to add JSONB columns
            db.session.execute(text("ALTER TABLE scr_ingredients ADD COLUMN IF NOT EXISTS unit_conversions JSONB DEFAULT '[]'::jsonb;"))
            db.session.execute(text("ALTER TABLE scr_ingredients ADD COLUMN IF NOT EXISTS substitutions JSONB DEFAULT '[]'::jsonb;"))
            db.session.commit()
            print("✅ Thành công! Các cột lưu dữ liệu AI đã được thêm vào bảng scr_ingredients an toàn.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Lỗi khi nâng cấp: {str(e)}")

if __name__ == "__main__":
    upgrade()
