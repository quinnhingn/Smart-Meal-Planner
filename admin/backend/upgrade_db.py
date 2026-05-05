from app import app
from database.db import db
from sqlalchemy import text

def upgrade():
    with app.app_context():
        print("🛠️  Đang nâng cấp Database: Thêm cột 'suitability'...")
        try:
            # PostgreSQL command to add JSONB column
            db.session.execute(text("ALTER TABLE scr_ingredients ADD COLUMN IF NOT EXISTS suitability JSONB DEFAULT '[]'::jsonb;"))
            db.session.commit()
            print("✅ Thành công! Cột 'suitability' đã được thêm vào bảng scr_ingredients.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Lỗi khi nâng cấp: {str(e)}")

if __name__ == "__main__":
    upgrade()
