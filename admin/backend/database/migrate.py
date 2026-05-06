import os
import sys
import glob

# Thêm đường dẫn để import được app và db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database.db import db
from sqlalchemy import text

def init_migration_table():
    """Tạo bảng theo dõi migration nếu chưa có"""
    db.session.execute(text("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """))
    db.session.commit()

def get_applied_migrations():
    """Lấy danh sách các file đã chạy thành công"""
    result = db.session.execute(text("SELECT filename FROM schema_migrations"))
    return [row[0] for row in result]

def run_migrations():
    with app.app_context():
        init_migration_table()
        applied_files = get_applied_migrations()
        
        # Trỏ ra thư mục migration chung ở bên ngoài
        migration_dir = os.path.join(os.path.dirname(__file__), '../../../backend/database/migration')
        sql_files = glob.glob(os.path.join(migration_dir, "*.sql"))
        
        # Sắp xếp theo tên để chạy đúng thứ tự 001 -> 002 -> 003...
        sql_files.sort()
        
        print(f"🕵️  Tìm thấy {len(sql_files)} file migration. Đang kiểm tra...")
        
        count = 0
        for file_path in sql_files:
            filename = os.path.basename(file_path)
            
            if filename in applied_files:
                # print(f"⏩ Đã bỏ qua: {filename} (Đã chạy trước đó)")
                continue
            
            print(f"🚀 Đang thực thi: {filename}...")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    sql_commands = f.read()
                
                # Chạy lệnh SQL
                db.session.execute(text(sql_commands))
                
                # Đánh dấu là đã chạy thành công
                db.session.execute(
                    text("INSERT INTO schema_migrations (filename) VALUES (:filename)"),
                    {"filename": filename}
                )
                db.session.commit()
                print(f"✅ Hoàn tất: {filename}")
                count += 1
            except Exception as e:
                db.session.rollback()
                print(f"❌ Lỗi tại file {filename}: {str(e)}")
                print("🛑 Đã dừng quá trình migration để đảm bảo an toàn dữ liệu.")
                return

        if count == 0:
            print("✨ Tuyệt vời! Cơ sở dữ liệu của bạn đã ở phiên bản mới nhất.")
        else:
            print(f"🎉 Tổng cộng đã chạy thành công {count} file migration mới.")

if __name__ == "__main__":
    print("\n--- 🛠️  SMART MEAL PLANNER - DATABASE MIGRATION SYSTEM ---")
    run_migrations()
    print("----------------------------------------------------------\n")
