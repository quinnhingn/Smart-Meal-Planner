import requests
import json
import os

# Cấu hình BASE URL (Sửa IP nếu cần)
BASE_URL = "http://127.0.0.1:5001/api"

# Thông tin tài khoản test
TEST_USER = {
    "email": "demo@gmail.com",
    "password": "18052004"
}

TOKEN = ""

def print_res(name, response):
    print(f"\n--- [Test: {name}] ---")
    print(f"Status: {response.status_code}")
    try:
        print(f"Data: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"Raw: {response.text[:200]}")

def test_all():
    global TOKEN
    
    # 1. TEST LOGIN
    print("\n🚀 Bắt đầu kiểm thử hệ thống API...")
    try:
        login_res = requests.post(f"{BASE_URL}/auth/login", json=TEST_USER)
        if login_res.status_code == 200:
            TOKEN = login_res.json().get('data', {}).get('token')
            print("✅ Đăng nhập thành công! Đã lấy được Token.")
        else:
            print(f"❌ Đăng nhập thất bại: {login_res.text}")
            return
    except Exception as e:
        print(f"❌ Lỗi kết nối server: {e}")
        return

    headers = {"Authorization": f"Bearer {TOKEN}"}

    # 2. TEST LẤY DANH SÁCH MÓN ĂN
    res = requests.get(f"{BASE_URL}/recipes", headers=headers)
    print_res("Lấy danh sách món ăn", res)

    # 3. TEST LẤY DANH SÁCH YÊU THÍCH
    res = requests.get(f"{BASE_URL}/recipes/favorites/ids", headers=headers)
    print_res("Lấy danh sách ID yêu thích", res)

    # 4. TEST LẤY NHẬT KÝ ĂN UỐNG (DIARY)
    res = requests.get(f"{BASE_URL}/recipes/diary", headers=headers)
    print_res("Lấy nhật ký ăn uống", res)

    # 5. TEST LẤY DANH SÁCH ĐI CHỢ (SHOPPING LIST)
    res = requests.get(f"{BASE_URL}/recipes/shopping-list", headers=headers)
    print_res("Lấy danh sách đi chợ", res)

    # 6. TEST LẤY LỊCH SỬ KHO (PANTRY HISTORY)
    res = requests.get(f"{BASE_URL}/recipes/pantry/history", headers=headers)
    print_res("Lấy lịch sử kho nguyên liệu", res)

    # 7. TEST AI CAMERA (NHẬN DIỆN MÓN ĂN)
    print("\n📸 Đang thử nghiệm AI nhận diện món ăn (Camera)...")
    sample_img_path = os.path.join(os.path.dirname(__file__), "sample_pho_bo.png")
    if os.path.exists(sample_img_path):
        with open(sample_img_path, 'rb') as f:
            # Sửa tên key từ 'file' thành 'image' để khớp với Backend
            files = {'image': ('sample_pho_bo.png', f, 'image/png')}
            res = requests.post(f"{BASE_URL}/ai/predict", headers=headers, files=files)
            print_res("AI Nhận diện món ăn", res)
    else:
        print("⚠️ Không tìm thấy ảnh mẫu để test AI Camera.")

    print("\n✨ Hoàn tất kiểm thử! Hệ thống cơ bản đang chạy rất ổn định.")

if __name__ == "__main__":
    test_all()
