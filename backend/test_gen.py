import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

duration_days = 7
bmi = 22.0
goal = "Giảm mỡ toàn thân"
difficulty = "Người mới"

prompt = f"""
Bạn là huấn luyện viên cá nhân ảo. Hãy tạo một lộ trình tập luyện {duration_days} ngày.
Hồ sơ người dùng: BMI {bmi}, Mục tiêu: {goal}, Trình độ: {difficulty}.

Trả về ĐÚNG định dạng JSON sau, không có text nào khác ngoài JSON:
{{
    "plan_title": "Tên lộ trình",
    "days": [
        {{
            "day_number": 1,
            "title": "Tên ngày tập",
            "duration_minutes": 20,
            "calories": 250,
            "sections": [
                {{
                    "id": "s1",
                    "title": "Phần 1: Khởi động",
                    "data": [
                        {{
                            "id": "e1",
                            "name_vn": "Jumping Jacks",
                            "duration_seconds": 60,
                            "reps": null,
                            "thumbnail": "https://img.youtube.com/vi/iSSAk4XCsZg/hqdefault.jpg",
                            "videoUrl": "https://www.youtube.com/watch?v=iSSAk4XCsZg",
                            "instructions": ["Bước 1", "Bước 2"],
                            "tips": "Nhảy nhẹ nhàng"
                        }}
                    ]
                }}
            ]
        }}
    ]
}}
Lưu ý: "days" phải là mảng có {duration_days} phần tử ({duration_days} ngày). Mỗi ngày có 1 hoặc 2 bài khởi động, 2-3 bài tập chính, 1 bài giãn cơ. Mảng "data" chứa các bài tập. Hãy dùng các bài phổ biến có youtube (có thể dùng dummy ID).
"""

try:
    response = gemini_model.generate_content(prompt)
    print("Raw response:")
    print(response.text)
    raw_text = response.text.replace("```json", "").replace("```", "").strip()
    result = json.loads(raw_text)
    print("JSON successfully parsed!")
except Exception as e:
    print(f"Error: {e}")
