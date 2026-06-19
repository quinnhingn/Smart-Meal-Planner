import os
import uuid
import requests
import json
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
from PIL import Image
import io
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db
from model.recipes.recipe_model import AIScanLogModel
from repository.recipes.recipe_repository import RecipeRepository

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Cấu hình Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://localhost:8001")

@ai_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict_and_log():
    lookup = None
    try:
        user_id = get_jwt_identity()
        mode = request.form.get('mode', 'diary') # 'diary' hoặc 'pantry'
        
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "Không tìm thấy file ảnh"}), 400
            
        file = request.files['image']
        
        # 1. Upload lên Cloudinary
        print(f"📤 [AI Flow] Mode: {mode} - Đang upload ảnh lên Cloudinary...")
        upload_result = cloudinary.uploader.upload(file, folder="ai_scans")
        image_url = upload_result.get("secure_url")
        
        predictions = []
        ai_data_for_log = {}

        # 2. Xử lý nhận diện dựa trên Mode
        if mode == 'pantry':
            # --- LUỒNG GEMINI (Cho Tủ lạnh - Nhiều món) ---
            print("🤖 [AI Flow] Đang gọi Gemini phân tích tủ lạnh...")
            file.seek(0)
            img_data = file.read()
            img = Image.open(io.BytesIO(img_data))
            
            prompt = """Bạn là trợ lý quản lý tủ lạnh thông minh. 
            Phân tích ảnh và liệt kê các nguyên liệu thực phẩm.
            Trả về JSON format:
            {
              "ingredients": [
                {
                  "name": "tên tiếng Việt",
                  "quantity": con số ước tính,
                  "unit": "g" hoặc "kg" hoặc "con" hoặc "bó" hoặc "trái",
                  "storage": "freezer" hoặc "fridge" hoặc "veggie_drawer",
                  "expiry_days": số ngày bảo quản tối đa gợi ý (số nguyên),
                  "confidence": 0.95
                }
              ]
            }
            Chỉ trả về JSON thuần túy, không thêm văn bản khác."""
            
            try:
                response = gemini_model.generate_content([prompt, img])
                raw_text = response.text.replace("```json", "").replace("```", "").strip()
                print(f"📩 [AI Flow] Gemini Response: {raw_text}")
                
                result = json.loads(raw_text)
                predictions = result.get("ingredients", [])
                for p in predictions:
                    p['label'] = p['name']
                ai_data_for_log = result
            except Exception as gemini_err:
                print(f"❌ [AI Flow] Lỗi Gemini: {str(gemini_err)}")
                return jsonify({"success": False, "message": f"Lỗi Gemini: {str(gemini_err)}"}), 500
        else:
            # --- LUỒNG YOLO (Cho Nhật ký - 1 món ăn) ---
            print(f"📡 [AI Flow] Đang gửi ảnh sang AI Server...")
            file.seek(0)
            ai_response = requests.post(
                f"{AI_SERVER_URL}/predict",
                files={'image': (file.filename, file.stream, file.mimetype)},
                timeout=20
            )
            ai_data = ai_response.json()
            if not ai_data.get('success'):
                return jsonify({"success": False, "message": "AI Server không nhận diện được"}), 500
            
            predictions = ai_data.get('predictions', [])
            ai_data_for_log = ai_data

        if not predictions:
            return jsonify({"success": False, "message": "Không nhận diện được nội dung ảnh"}), 404
            
        # 3. Tra cứu dinh dưỡng (Chỉ cho mode diary)
        processed_items = []
        confirmed_dish_ids = []
        
        if mode == 'diary':
            import re
            def parse_servings(s):
                if not s: return 1.0
                try: return float(s)
                except ValueError:
                    match = re.search(r'\d+', str(s))
                    return float(match.group()) if match else 1.0

            candidates_list = []
            
            # Map predictions to candidates
            for p in predictions:
                label = p['label']
                conf = p['confidence']
                lookup = RecipeRepository.find_by_name_with_nutrition(label)
                
                if lookup:
                    nutrition_info = lookup['nutrition']
                    servings = parse_servings(lookup.get('servings', 1))
                    candidates_list.append({
                        "id": lookup['id'], 
                        "name": lookup['name'], 
                        "confidence": conf, 
                        "base_calo": nutrition_info.get('calories', 0) / servings,
                        "base_protein": nutrition_info.get('protein', 0) / servings,
                        "base_carbs": nutrition_info.get('carbs', 0) / servings,
                        "base_fat": nutrition_info.get('fat', 0) / servings
                    })
            if candidates_list:
                main_candidate = candidates_list[0]
                confirmed_dish_ids.append(main_candidate['id'])
                    
                processed_items.append({
                    "id": str(uuid.uuid4()),
                    "name": main_candidate['name'],
                    "base_calo": main_candidate['base_calo'],
                    "base_protein": main_candidate['base_protein'],
                    "base_carbs": main_candidate['base_carbs'],
                    "base_fat": main_candidate['base_fat'],
                    "servings_input": 1, # Mặc định 1 khẩu phần
                    "image_url": image_url,
                    "recipe_id": main_candidate['id'],
                    "candidates": candidates_list
                })
        else:
            processed_items = predictions # Đối với pantry, giữ nguyên mảng
        
        # 4. Lưu Log vào Database
        print("💾 [AI Flow] Bắt đầu lưu lịch sử vào DB...")
        scan_log = AIScanLogModel()
        scan_log.id = uuid.uuid4()
        scan_log.user_id = user_id
        scan_log.scan_type = 'cooked_meal' if mode == 'diary' else 'ingredient'
        scan_log.image_url = image_url
        scan_log.ai_result = ai_data_for_log
        scan_log.confirmed_dish_id = confirmed_dish_ids[0] if confirmed_dish_ids else None
        scan_log.was_corrected = False
        
        db.session.add(scan_log)
        db.session.commit()
        print(f"✅ [AI Flow] Đã lưu Log thành công! (Mode: {mode})")
        
        # 5. Trả về kết quả
        print("📤 [AI Flow] Đang trả kết quả về cho App...")
        return jsonify({
            "success": True,
            "data": {
                "items": processed_items,
                "image_url": image_url,
                "log_id": str(scan_log.id),
                "raw_predictions": predictions
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"❌ [AI Flow ERROR] Chi tiết lỗi:\n{traceback.format_exc()}")
        return jsonify({"success": False, "message": f"Lỗi xử lý AI: {str(e)}"}), 500

@ai_bp.route('/nutrition-insight', methods=['GET'])
@jwt_required()
def get_nutrition_insight():
    try:
        user_id = get_jwt_identity()
        summary = RecipeRepository.get_daily_summary(user_id)
        
        from model.auth.user_profile_model import UserProfileModel
        profile = UserProfileModel.query.filter_by(user_id=user_id).first()
        
        if not profile:
            return jsonify({"success": True, "data": {"insight": "Hoàn thiện hồ sơ để AI bắt mạch dinh dưỡng cho bạn nhé! ✨", "missing_nutrient": "None"}}), 200
            
        today_stats = summary['totals']
        targets = {
            "calories": profile.target_calories or 2000,
            "protein": profile.target_protein_g or 150,
            "carbs": profile.target_carbs_g or 250,
            "fat": profile.target_fat_g or 60
        }

        # 1. TÍNH TOÁN BẰNG CODE (SIÊU NHANH)
        deficits = {
            "Protein": max(0, targets['protein'] - today_stats['protein']),
            "Carbohydrate": max(0, targets['carbs'] - today_stats['carbs']),
            "Chất béo": max(0, targets['fat'] - today_stats['fat'])
        }
        
        # Tìm chất thiếu nhiều nhất (%)
        missing_ratios = {
            "Protein": deficits["Protein"] / targets["protein"] if targets["protein"] > 0 else 0,
            "Carbohydrate": deficits["Carbohydrate"] / targets["carbs"] if targets["carbs"] > 0 else 0,
            "Chất béo": deficits["Chất béo"] / targets["fat"] if targets["fat"] > 0 else 0
        }
        
        main_missing = max(missing_ratios, key=missing_ratios.get)
        amount_missing = round(deficits[main_missing], 1)

        # 2. LẤY ĐỒ TRONG TỦ LẠNH
        from model.recipes.recipe_model import UserPantryModel
        pantry_items = UserPantryModel.query.filter_by(user_id=user_id).limit(3).all()
        pantry_names = [item.ingredient_name for item in pantry_items]

        # 3. CHỌN LỜI KHUYÊN PHÙ HỢP (THAY VÌ GỌI GEMINI MỖI LẦN)
        templates = {
            "Protein": f"Bạn đang thiếu khoảng {amount_missing}g Protein. Hãy nạp thêm đạm để cơ bắp săn chắc nhé!",
            "Carbohydrate": f"Năng lượng từ tinh bột đang thấp (thiếu {amount_missing}g). Bạn cần thêm xíu tinh bột để hoạt động tốt hơn.",
            "Chất béo": f"Cơ thể đang cần thêm khoảng {amount_missing}g chất béo tốt để hấp thụ vitamin. Đừng bỏ qua mảng này nhé!"
        }
        
        insight_text = templates.get(main_missing, "Bạn đang duy trì tỉ lệ dinh dưỡng rất tốt! Tiếp tục phát huy nhé. ✨")
        
        # Nếu có đồ trong tủ lạnh, gợi ý thêm
        if pantry_names:
            insight_text += f" Trong tủ lạnh của bạn đang có {', '.join(pantry_names)}, hãy thử chế biến chúng cho bữa tới nhé!"

        return jsonify({
            "success": True,
            "data": {
                "insight": insight_text,
                "missing_nutrient": main_missing
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@ai_bp.route('/suggest-recipes-pantry', methods=['GET'])
@jwt_required()
def suggest_recipes_pantry():
    try:
        user_id = get_jwt_identity()
        
        # 1. Lấy đồ trong tủ lạnh
        from model.recipes.recipe_model import UserPantryModel
        pantry_items = UserPantryModel.query.filter_by(user_id=user_id).all()
        pantry_names = [item.ingredient_name.lower() for item in pantry_items]
        
        if not pantry_names:
            return jsonify({"success": True, "data": []}), 200
            
        # 2. Đọc file recipe.json (Sử dụng đường dẫn tuyệt đối)
        recipe_path = "/Volumes/KINGSTON/NAM3/smart-meal-planner/Smart-Meal-Planner/admin/backend/data/recipe.json"
        with open(recipe_path, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
            
        # 3. Tính điểm khớp nguyên liệu
        scored_recipes = []
        for r in recipes:
            ingr_str = r.get("Nguyên liệu (Tên: Khối lượng)", "").lower()
            match_count = 0
            for p in pantry_names:
                if p in ingr_str:
                    match_count += 1
            
            if match_count > 0:
                scored_recipes.append({
                    "recipe": r,
                    "score": match_count
                })
        
        # Sắp xếp theo score giảm dần và lấy top 3
        scored_recipes.sort(key=lambda x: x['score'], reverse=True)
        top_3 = scored_recipes[:3]
        
        results = []
        tavily_key = os.getenv("TAVILY_API_KEY")
        
        # Hàm tìm ảnh và video cho 1 món
        def get_dish_media(dish_name):
            media = {
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
                "video": ""
            }
            try:
                # 1. Tìm ảnh
                resp_img = requests.post("https://api.tavily.com/search", json={
                    "api_key": tavily_key,
                    "query": f"món ăn {dish_name} vietnam food photography",
                    "include_images": True,
                    "search_depth": "basic"
                }, timeout=5)
                res_img = resp_img.json()
                if res_img.get('images'):
                    media["image"] = res_img['images'][0]
                
                # 2. Tìm Video YouTube
                resp_vid = requests.post("https://api.tavily.com/search", json={
                    "api_key": tavily_key,
                    "query": f"cách nấu {dish_name} youtube",
                    "search_depth": "basic"
                }, timeout=5)
                res_vid = resp_vid.json()
                for result in res_vid.get('results', []):
                    if 'youtube.com/watch' in result['url']:
                        media["video"] = result['url']
                        break
            except:
                pass
            return media

        # Chạy tìm media song song cho cả 3 món
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=3) as executor:
            dish_names = [item['recipe']["Tên món ăn"] for item in top_3]
            medias = list(executor.map(get_dish_media, dish_names))
        
        for idx, item in enumerate(top_3):
            r = item['recipe']
            results.append({
                "name": r["Tên món ăn"],
                "image": medias[idx]["image"],
                "video": medias[idx]["video"],
                "score": item['score'],
                "difficulty": r.get("Độ khó", "Dễ"),
                "time": r.get("Thời gian nấu", "30 phút"),
                "ingredients": r.get("Nguyên liệu (Tên: Khối lượng)"),
                "steps": r.get("Các bước thực hiện"),
                "nutrition_advice": r.get("Lời khuyên dinh dưỡng")
            })
            
        return jsonify({
            "success": True,
            "data": results
        }), 200
        
    except Exception as e:
        print(f"❌ [Suggest Recipes Error] {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@ai_bp.route('/log-external-recipe', methods=['POST'])
@jwt_required()
def log_external_recipe():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        from model.recipes.recipe_model import MealLogModel, UserPantryModel, PantryHistoryModel
        import uuid
        from datetime import datetime

        dish_name = data.get('name')
        if not dish_name:
            return jsonify({"success": False, "message": "Thiếu tên món ăn"}), 400
            
        print(f"🚀 [Log AI - Lite] Đang log món: {dish_name}")

        # 1. Ghi thẳng vào Meal Logs (Không cần recipe_id)
        # Cách này cực kỳ an toàn, không sợ lỗi bảng Recipe
        log_entry = MealLogModel(
            id=uuid.uuid4(),
            user_id=user_id,
            recipe_id=None, # Để trống ID công thức vì đây là món "vãng lai" từ AI
            meal_name=dish_name,
            meal_type=data.get('meal_type', 'Bữa tối'),
            servings=float(data.get('selected_servings') or 1.0),
            calories_consumed=float(data.get('calories') or 450),
            protein_g=float(data.get('protein') or 30),
            fat_g=float(data.get('fat') or 15),
            carbs_g=float(data.get('carbs') or 45),
            eaten_at=datetime.utcnow()
        )
        db.session.add(log_entry)
        print("✅ [Log AI] Đã ghi nhật ký ăn uống")

        # 2. Trừ đồ trong tủ lạnh và lưu lịch sử (Vẫn hoạt động bình thường)
        pantry_items = UserPantryModel.query.filter_by(user_id=user_id).all()
        
        # Lấy nguyên liệu từ chuỗi text gửi lên
        ingr_raw = data.get('ingredients', "")
        ingr_list = [x.strip().lower() for x in ingr_raw.split(',') if x.strip()]
        
        deducted_count = 0
        for ing_text in ingr_list:
            for p_item in pantry_items:
                p_name = p_item.ingredient_name.lower().strip()
                if p_name in ing_text or ing_text in p_name:
                    # Ghi lịch sử
                    history_entry = PantryHistoryModel(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        ingredient_name=p_item.ingredient_name,
                        quantity=float(p_item.quantity or 1.0),
                        unit=p_item.unit or 'g',
                        action_type='consumed',
                        recipe_id=None,
                        recipe_name=dish_name
                    )
                    db.session.add(history_entry)
                    # Trừ đồ
                    db.session.delete(p_item)
                    deducted_count += 1
                    break
        
        db.session.commit()
        print(f"✅ [Log AI] Hoàn tất! Đã trừ {deducted_count} món tủ lạnh")
        
        return jsonify({
            "success": True, 
            "message": f"Đã ghi nhận {dish_name} thành công!",
            "recipe_id": None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"❌ [Log AI Lite Error]:\n{traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500
