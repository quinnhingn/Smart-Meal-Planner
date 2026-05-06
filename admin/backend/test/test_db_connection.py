import os
import psycopg2
from dotenv import load_dotenv

# Tìm file .env ở thư mục gốc (đi ngược lên 3 cấp từ admin/backend/test)
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '../../../.env')
load_dotenv(dotenv_path)

database_url = os.getenv("DATABASE_URL")

def test_connection():
    if not database_url:
        print("❌ Lỗi: Không tìm thấy DATABASE_URL trong file .env")
        return

    print(f"🔄 Đang thử kết nối tới: {database_url.split('@')[-1]}") # Chỉ in phần host để bảo mật
    
    try:
        # Kết nối tới database
        conn = psycopg2.connect(database_url)
        print("✅ Kết nối database thành công!")
        
        # Thử thực hiện một query đơn giản
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        print(f"📦 Phiên bản Database: {db_version[0]}")
        
        # Thử list các table hiện có (nếu có)
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cur.fetchall()
        if tables:
            print(f"📋 Các bảng hiện có: {[t[0] for t in tables]}")
        else:
            print("ℹ️ Database trống (chưa có bảng nào).")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Kết nối thất bại: {e}")

if __name__ == "__main__":
    test_connection()
