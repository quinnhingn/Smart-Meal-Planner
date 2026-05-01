-- Migration 003: Create scr_ingredients table
-- Chức năng: Lưu trữ Master Data các nguyên liệu để tính toán calo và nhận diện AI

CREATE TABLE IF NOT EXISTS scr_ingredients (
    id SERIAL PRIMARY KEY, -- Dùng SERIAL (Integer tự tăng) để ID ngắn gọn, dễ query
    name_vn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100), -- 'meat', 'vegetable', 'dairy', 'grain', 'fruit', 'seasoning'
    image_url VARCHAR(500),
    default_unit VARCHAR(50), -- 'quả', 'thìa', 'mớ', 'g', 'ml'
    gram_per_unit FLOAT, -- Trọng lượng quy đổi. VD: 1 quả = 120g
    calories_per_100g FLOAT NOT NULL,
    protein_per_100g FLOAT DEFAULT 0,
    fat_per_100g FLOAT DEFAULT 0,
    carbs_per_100g FLOAT DEFAULT 0,
    created_by UUID REFERENCES scr_users(id) ON DELETE SET NULL, -- Admin nào đã tạo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu tìm kiếm theo tên khi Admin search hoặc app Gợi ý món
CREATE INDEX IF NOT EXISTS idx_scr_ingredients_name_vn ON scr_ingredients(name_vn);
CREATE INDEX IF NOT EXISTS idx_scr_ingredients_category ON scr_ingredients(category);
