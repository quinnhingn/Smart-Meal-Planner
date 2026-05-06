import os
import json
import re
from flask import Blueprint, request, jsonify

recipe_json_bp = Blueprint('recipe_json', __name__)

# Đường dẫn tới thư mục data (Lùi 3 cấp: controller/recipes/recipe_json_controller.py -> controller/recipes -> controller -> backend)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')

def parse_ingredients_string(ing_str):
    """
    Hàm phân tách chuỗi nguyên liệu phức tạp từ JSON thành danh sách object.
    VD: 'Chính: Thăn bò: 100g, Bún tươi: 150g' -> [{name: 'Thăn bò', grams: 100}, ...]
    """
    ingredients = []
    # Loại bỏ các từ khóa phân loại như 'Chính:', 'Phụ:', 'Rau:', 'Gia vị:'
    clean_str = re.sub(r'(Chính|Phụ|Rau|Gia vị|Sốt|Kèm):', '', ing_str)
    
    # Tách bằng dấu phẩy hoặc chấm
    parts = re.split(r'[,.]', clean_str)
    
    for p in parts:
        p = p.strip()
        if not p: continue
        
        # Tìm phần tên và khối lượng (số + g/ml)
        match = re.search(r'(.+?):\s*(\d+)\s*(g|ml|kg|l)?', p)
        if match:
            name = match.group(1).strip()
            grams = int(match.group(2))
            # Nếu là kg hoặc l thì quy đổi về g/ml (tạm thời)
            unit = match.group(3)
            if unit == 'kg' or unit == 'l':
                grams *= 1000
            
            ingredients.append({
                "name": name,
                "grams": grams
            })
        else:
            # Nếu không tìm thấy khối lượng, chỉ lấy tên
            ingredients.append({
                "name": p,
                "grams": 0
            })
    return ingredients

@recipe_json_bp.route('/search-json', methods=['GET'])
def search_recipe_json():
    query = request.args.get('q', '').lower().strip()
    if not query:
        return jsonify({"message": "Vui lòng nhập tên món ăn"}), 400

    results = []
    
    # 1. Đọc recipe.json
    try:
        with open(os.path.join(DATA_DIR, 'recipe.json'), 'r', encoding='utf-8') as f:
            data1 = json.load(f)
            for item in data1:
                if query in item.get('Tên món ăn', '').lower():
                    # Parse nguyên liệu
                    ings = parse_ingredients_string(item.get('Nguyên liệu (Tên: Khối lượng)', ''))
                    # Parse các bước
                    steps = [s.strip() for s in item.get('Các bước thực hiện', '').split('|')]
                    
                    results.append({
                        "name": item.get('Tên món ăn'),
                        "name_en": item.get('Tên tiếng Anh'),
                        "goals": [g.strip() for g in item.get('Mục tiêu', '').split(',')],
                        "meal_times": [m.strip() for m in item.get('Bữa ăn', '').split(',')],
                        "ingredients": ings,
                        "steps": steps,
                        "source": "recipe.json"
                    })
    except Exception as e:
        print(f"Lỗi đọc recipe.json: {e}")

    # 2. Đọc recipe-add.json (nếu chưa tìm thấy đủ kết quả)
    if len(results) < 5:
        try:
            with open(os.path.join(DATA_DIR, 'recipe-add.json'), 'r', encoding='utf-8') as f:
                data2 = json.load(f)
                for item in data2:
                    if query in item.get('Tên món ăn', '').lower():
                        results.append({
                            "name": item.get('Tên món ăn'),
                            "ingredients_raw": item.get('Nguyên liệu'),
                            "instruction": item.get('Công thức'),
                            "meal_times": [item.get('Bữa ăn')],
                            "source": "recipe-add.json"
                        })
        except Exception as e:
            print(f"Lỗi đọc recipe-add.json: {e}")

    return jsonify(results)
