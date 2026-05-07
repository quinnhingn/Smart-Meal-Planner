import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# ===== PATCH: fix Keras 3 legacy h5 loading =====
from keras.src.ops.operation import Operation

_orig = Operation.from_config.__func__

@classmethod
def _patched(cls, config):
    config.pop('quantization_config', None)
    config.pop('optional', None)
    # Với InputLayer: chuyển batch_shape -> shape
    if 'batch_shape' in config:
        batch_shape = config.pop('batch_shape')
        config['shape'] = batch_shape[1:]  # bỏ None đầu tiên
    config.pop('sparse', None)
    config.pop('ragged', None)
    return _orig(cls, config)

Operation.from_config = _patched
# ===== END PATCH =====

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as image_utils
from PIL import Image, ImageOps
import io

app = Flask(__name__)
CORS(app)

CLASSES = [
    'Bánh bèo', 'Bánh bột lọc', 'Bánh căn', 'Bánh canh', 'Bánh chưng',
    'Bánh cuốn', 'Bánh đúc', 'Bánh giò', 'Bánh khọt', 'Bánh mì',
    'Bánh pía', 'Bánh tét', 'Bánh tráng nướng', 'Bánh xèo', 'Bún bò Huế',
    'Bún đậu mắm tôm', 'Bún mắm', 'Bún riêu', 'Bún thịt nướng', 'Cá kho tộ',
    'Canh chua', 'Cao lầu', 'Cháo lòng', 'Cơm tấm', 'Gỏi cuốn',
    'Hủ tiếu', 'Mì Quảng', 'Nem chua', 'Phở', 'Xôi xéo'
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'train_data/base_model_best.h5')
model = None

def get_model():
    global model
    if model is None:
        print(f"📡 Đang nạp Model từ: {MODEL_PATH}...")
        model = load_model(MODEL_PATH, compile=False)
        print("✅ Model đã sẵn sàng!")
    return model

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "Không tìm thấy ảnh"}), 400
    file = request.files['image']
    try:
        # Đọc ảnh từ request
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # 1. FIX LỖI XOAY ẢNH: Đảm bảo ảnh luôn đúng chiều
        img = ImageOps.exif_transpose(img)
        
        # 2. CENTER CROP: Cắt lấy phần trung tâm hình vuông để không bị méo ảnh
        width, height = img.size
        new_size = min(width, height)
        left = (width - new_size) / 2
        top = (height - new_size) / 2
        right = (width + new_size) / 2
        bottom = (height + new_size) / 2
        img = img.crop((left, top, right, bottom))
        
        # 3. RESIZE & CHUẨN HÓA
        img = img.resize((300, 300))
        img_array = image_utils.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        current_model = get_model()
        predictions = current_model.predict(img_array)
        
        # Lấy Top 3 kết quả cao nhất
        top_indices = np.argsort(predictions[0])[-3:][::-1]
        top_results = []
        for idx in top_indices:
            top_results.append({
                "label": CLASSES[idx],
                "confidence": float(predictions[0][idx])
            })

        return jsonify({
            "success": True,
            "predictions": top_results,
            "message": "Nhận diện thành công"
        })
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ready", "model_loaded": model is not None})

if __name__ == '__main__':
    get_model()
    print("🚀 AI Service đang chạy trên cổng 8001...")
    app.run(host='0.0.0.0', port=8001, debug=False)