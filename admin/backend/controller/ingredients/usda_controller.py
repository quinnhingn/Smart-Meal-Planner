import os
import requests
import re
from flask import Blueprint, request, jsonify
from deep_translator import GoogleTranslator
from dotenv import load_dotenv

usda_bp = Blueprint('usda', __name__)

# Load env để lấy API KEY
load_dotenv()
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

def translate_to_en(text):
    try:
        # Làm sạch tên trước khi dịch
        clean_text = re.sub(r'(Gia vị sốt|Thành phần|Kèm|Sốt):', '', text).strip()
        translated = GoogleTranslator(source='vi', target='en').translate(clean_text)
        return translated
    except Exception as e:
        print(f"Lỗi dịch thuật: {e}")
        return text

@usda_bp.route('/lookup-usda', methods=['POST'])
def lookup_usda():
    data = request.json
    vi_name = data.get('name')
    
    if not vi_name:
        return jsonify({"success": False, "message": "Thiếu tên nguyên liệu"}), 400

    # 1. Dịch sang tiếng Anh
    en_name = translate_to_en(vi_name)
    # Thêm từ khóa "Raw" hoặc "Simple" để USDA không tìm nhầm sang món đã chế biến
    search_query = en_name
    if len(en_name.split()) == 1:
        search_query = f"Raw {en_name}"

    print(f"🔍 Tra cứu USDA: {vi_name} -> {search_query}")

    # 2. Gọi USDA API
    params = {
        "api_key": USDA_API_KEY,
        "query": search_query,
        "pageSize": 5, # Lấy 5 cái để lọc cái tốt nhất
        "dataType": ["Foundation Foods", "Survey (FNDDS)", "Branded"]
    }

    try:
        response = requests.get(USDA_BASE_URL, params=params)
        res_data = response.json()

        if res_data.get('foods') and len(res_data['foods']) > 0:
            # Tìm kết quả nào có tên ngắn gọn nhất (thường là nguyên liệu thô)
            best_food = sorted(res_data['foods'], key=lambda x: len(x.get('description', '')))[0]
            
            nutrients = best_food.get('foodNutrients', [])
            result = {
                "success": True,
                "name_en": en_name,
                "fdcId": best_food.get('fdcId'),
                "description": best_food.get('description'),
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }

            for n in nutrients:
                # USDA Branded foods dùng tên khác cho Nutrient
                name = n.get('nutrientName', '').lower()
                val = n.get('value', 0)
                
                if 'energy' in name and 'kcal' in n.get('unitName', '').lower(): result["calories"] = val
                elif 'protein' in name: result["protein"] = val
                elif 'total lipid' in name or 'fat' in name: result["fat"] = val
                elif 'carbohydrate' in name: result["carbs"] = val

            return jsonify(result)
        else:
            return jsonify({
                "success": False, 
                "message": "Không tìm thấy thông tin trên USDA",
                "name_en": en_name
            })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
