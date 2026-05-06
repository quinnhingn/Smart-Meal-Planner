-- Migration 004: Create scr_recipes table
-- Chức năng: Lưu trữ thông tin công thức nấu ăn, thành phần dinh dưỡng và hướng dẫn thực hiện

CREATE TABLE IF NOT EXISTS scr_recipes (
    id SERIAL PRIMARY KEY,
    name_vn VARCHAR(255) NOT NULL, -- Tên món ăn
    image_url VARCHAR(500), -- Link ảnh (đã tách nền hoặc ảnh gốc)
    video_url VARCHAR(500), -- Link video YouTube hướng dẫn
    
    -- Dùng JSONB để lưu danh sách vì một món có thể có nhiều mục tiêu/bữa ăn
    goals JSONB DEFAULT '[]', -- VD: ["lose", "keto", "diabetic"]
    meal_times JSONB DEFAULT '[]', -- VD: ["breakfast", "lunch"]
    
    -- Lưu danh sách nguyên liệu chi tiết (ID, tên, khối lượng, màu sắc...)
    -- VD: [{"id": 1, "name": "Thịt bò", "grams": 200, "calories": 500}, ...]
    ingredients JSONB NOT NULL DEFAULT '[]', 
    
    -- Lưu danh sách các bước thực hiện
    -- VD: ["Băm tỏi", "Xào thịt", ...]
    steps JSONB DEFAULT '[]', 
    
    -- Thông số dinh dưỡng tổng hợp của cả món (để hiển thị nhanh trên UI)
    total_calories FLOAT DEFAULT 0,
    total_protein FLOAT DEFAULT 0,
    total_carbs FLOAT DEFAULT 0,
    total_fat FLOAT DEFAULT 0,
    
    -- AI Insight: Lưu lại đánh giá hoặc lời khuyên từ AI cho món này
    ai_insight TEXT,
    
    created_by UUID REFERENCES scr_users(id) ON DELETE SET NULL, -- Admin tạo món
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm món ăn nhanh hơn
CREATE INDEX IF NOT EXISTS idx_scr_recipes_name_vn ON scr_recipes(name_vn);

-- Gán nhãn trigger để tự động cập nhật updated_at (nếu có hệ thống trigger)
-- CREATE TRIGGER update_scr_recipes_modtime BEFORE UPDATE ON scr_recipes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
