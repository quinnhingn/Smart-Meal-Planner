-- Bảng Tủ lạnh ảo của User
CREATE TABLE IF NOT EXISTS scr_user_pantry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL, -- Lưu tên do AI nhận diện
    ingredient_id INTEGER NULL,            -- Link tới bảng chuẩn (nếu có)
    quantity FLOAT DEFAULT 1.0,
    unit VARCHAR(50) DEFAULT 'g',
    storage_location VARCHAR(50) DEFAULT 'fridge', -- freezer, fridge, veggie_drawer
    expiry_date DATE NULL,
    source VARCHAR(50) DEFAULT 'ai_scan', -- ai_scan, manual, shopping
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm nhanh theo user
CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON scr_user_pantry(user_id);
