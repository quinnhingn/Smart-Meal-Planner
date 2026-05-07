import os
from flask import Blueprint, request, jsonify
from tavily import TavilyClient
from dotenv import load_dotenv

video_bp = Blueprint('video', __name__)

# Load env để lấy API KEY
load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

@video_bp.route('/search-video', methods=['POST'])
def search_video():
    data = request.json
    recipe_name = data.get('name')
    
    if not recipe_name:
        return jsonify({"success": False, "message": "Thiếu tên món ăn"}), 400

    if not TAVILY_API_KEY:
        return jsonify({"success": False, "message": "Chưa cấu hình TAVILY_API_KEY"}), 500

    try:
        tavily = TavilyClient(api_key=TAVILY_API_KEY)
        
        # Prompt tối ưu để tìm video chất lượng cao
        query = f"youtube video công thức nấu món {recipe_name} hướng dẫn chi tiết nhiều lượt xem nhất"
        
        # Tìm kiếm trên web qua Tavily
        search_result = tavily.search(query=query, search_depth="advanced", max_results=8)
        
        import requests
        
        # Lọc và KIỂM TRA từng video xem có cho nhúng không
        valid_video_url = ""
        for result in search_result.get('results', []):
            url = result.get('url', '')
            if 'youtube.com/watch?v=' in url or 'youtu.be/' in url:
                # Kiểm tra quyền nhúng qua YouTube oEmbed API
                try:
                    check_url = f"https://www.youtube.com/oembed?url={url}&format=json"
                    response = requests.get(check_url, timeout=5)
                    
                    # Nếu response code là 200 thì video này OK, cho phép nhúng
                    if response.status_code == 200:
                        valid_video_url = url
                        break
                    else:
                        print(f"⏩ Bỏ qua video {url} do bị chặn nhúng (Status: {response.status_code})")
                except:
                    continue
        
        if valid_video_url:
            return jsonify({
                "success": True,
                "video_url": valid_video_url,
                "query": query
            })
        else:
            return jsonify({
                "success": False, 
                "message": "Không tìm thấy video nào cho phép hiển thị trên ứng dụng này."
            })

    except Exception as e:
        print(f"Lỗi hệ thống: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
