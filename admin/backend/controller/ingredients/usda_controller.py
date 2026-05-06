import os
import requests
import re
import json
from flask import Blueprint, request, jsonify
from deep_translator import GoogleTranslator
from dotenv import load_dotenv

usda_bp = Blueprint('usda', __name__)

load_dotenv()
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

MATERIAL_DATA_PATH = os.path.join(os.path.dirname(__file__), "../../data/material.json")

def translate_to_en(text):
    try:
        # Làm sạch tên trước khi dịch
        clean_text = re.sub(r'(Gia vị sốt|Thành phần|Kèm|Sốt):', '', text).strip()
        translated = GoogleTranslator(source='vi', target='en').translate(clean_text)
        return translated
    except Exception as e:
        print(f"Lỗi dịch thuật: {e}")
        return text

def search_local_material(name):
    """Tìm kiếm nguyên liệu trong file JSON cục bộ"""
    if not os.path.exists(MATERIAL_DATA_PATH):
        print(f"⚠️ Không tìm thấy file local: {MATERIAL_DATA_PATH}")
        return None
    
    try:
        with open(MATERIAL_DATA_PATH, 'r', encoding='utf-8') as f:
            materials = json.load(f)
            name_lower = name.lower().strip()
            for m in materials:
                m_name = m.get("Tên nguyên liệu", "").lower().strip()
                if m_name == name_lower:
                    return m
            
            for m in materials:
                m_name = m.get("Tên nguyên liệu", "").lower().strip()
                if name_lower in m_name or m_name in name_lower:
                    return m
                    
            return None
    except Exception as e:
        print(f"❌ Lỗi đọc file material.json: {e}")
        return None

@usda_bp.route('/lookup-usda', methods=['POST'])
def lookup_usda():
    data = request.json
    vi_name = data.get('name')
    
    if not vi_name:
        return jsonify({"success": False, "message": "Thiếu tên nguyên liệu"}), 400

    print(f"\n--- 🍎 Tra cứu nguyên liệu: {vi_name} ---")

    local_match = search_local_material(vi_name)
    if local_match:
        res_name = local_match.get("Tên nguyên liệu")
        cal = local_match.get("Calo (kcal)", 0)
        prot = local_match.get("Đạm (g)", 0)
        fat = local_match.get("Béo (g)", 0)
        carb = local_match.get("Carb (g)", 0)
        
        print(f"✅ [LOCAL] Tìm thấy: {res_name}")
        print(f"   📊 Dinh dưỡng: Calo: {cal}, Đạm: {prot}, Béo: {fat}, Carb: {carb}")
        
        return jsonify({
            "success": True,
            "source": "local",
            "name": res_name,
            "calories": cal,
            "protein": prot,
            "fat": fat,
            "carbs": carb,
            "description": f"Dữ liệu từ hệ thống nội bộ (Quy đổi: {local_match.get('Đơn vị quy đổi', '100g')})"
        })

    print(f"❌ [LOCAL] Không tìm thấy '{vi_name}'. Đang chuyển sang USDA...")
    en_name = translate_to_en(vi_name)
    search_query = en_name
    if len(en_name.split()) == 1:
        search_query = f"Raw {en_name}"

    print(f"🔍 [USDA] Đang tìm kiếm với từ khóa: '{search_query}'")

    params = {
        "api_key": USDA_API_KEY,
        "query": search_query,
        "pageSize": 5,
        "dataType": ["Foundation Foods", "Survey (FNDDS)", "Branded"]
    }

    try:
        response = requests.get(USDA_BASE_URL, params=params)
        res_data = response.json()

        if res_data.get('foods') and len(res_data['foods']) > 0:
            best_food = sorted(res_data['foods'], key=lambda x: len(x.get('description', '')))[0]
            
            nutrients = best_food.get('foodNutrients', [])
            result = {
                "success": True,
                "source": "usda",
                "name_en": en_name,
                "fdcId": best_food.get('fdcId'),
                "description": best_food.get('description'),
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }

            for n in nutrients:
                name = n.get('nutrientName', '').lower()
                val = n.get('value', 0)
                if 'energy' in name and 'kcal' in n.get('unitName', '').lower(): result["calories"] = val
                elif 'protein' in name: result["protein"] = val
                elif 'total lipid' in name or 'fat' in name: result["fat"] = val
                elif 'carbohydrate' in name: result["carbs"] = val

            print(f"✅ [USDA] Tìm thấy: {best_food.get('description')}")
            print(f"   📊 Dinh dưỡng: Calo: {result['calories']}, Đạm: {result['protein']}, Béo: {result['fat']}, Carb: {result['carbs']}")
            
            return jsonify(result)
        else:
            print(f"⚠️ [USDA] Không tìm thấy kết quả nào cho '{search_query}'")
            return jsonify({
                "success": False, 
                "message": "Không tìm thấy thông tin trên USDA hoặc local",
                "name_en": en_name
            })

    except Exception as e:
        print(f"💥 [ERROR] Lỗi hệ thống: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
