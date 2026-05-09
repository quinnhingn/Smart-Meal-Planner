-- Migration 010: Tạo bảng scr_ai_scan_logs để lưu lịch sử nhận diện
-- Mục tiêu: Thu thập dữ liệu để train lại model YOLO sau này
-- Ngày tạo: 09/05/2026

CREATE TABLE IF NOT EXISTS scr_ai_scan_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES scr_users(id) ON DELETE SET NULL,
    
    -- Loại quét: 'ingredient' (tủ lạnh) hoặc 'cooked_meal' (nhật ký)
    scan_type       VARCHAR(50) NOT NULL,
    
    -- Link ảnh lưu trên Cloudinary
    image_url       VARCHAR(500),
    
    -- Kết quả thô từ AI model: {"label": "Phở", "confidence": 0.95, "predictions": [...]}
    ai_result       JSONB,
    
    -- Món ăn/Nguyên liệu mà user thực sự chọn (để biết AI đúng hay sai)
    confirmed_dish_id       INTEGER, -- FK tới scr_dishes_calories hoặc scr_ingredients (tuỳ loại)
    
    -- Đánh dấu model nhận diện sai để lọc ra train lại nhanh hơn
    was_corrected   BOOLEAN DEFAULT FALSE,
    
    scanned_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để truy vấn lịch sử của user nhanh hơn
CREATE INDEX IF NOT EXISTS idx_scr_ai_scan_logs_user_id ON scr_ai_scan_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_scr_ai_scan_logs_scanned_at ON scr_ai_scan_logs(scanned_at);
