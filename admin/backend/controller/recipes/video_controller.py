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
        search_result = tavily.search(query=query, search_depth="advanced", max_results=5)
        
        # Lọc ra kết quả có chứa link youtube
        video_url = ""
        for result in search_result.get('results', []):
            url = result.get('url', '')
            if 'youtube.com/watch?v=' in url or 'youtu.be/' in url:
                video_url = url
                break
        
        if video_url:
            return jsonify({
                "success": True,
                "video_url": video_url,
                "query": query
            })
        else:
            return jsonify({
                "success": False, 
                "message": "Không tìm thấy video phù hợp trên Youtube"
            })

    except Exception as e:
        print(f"Lỗi Tavily: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
