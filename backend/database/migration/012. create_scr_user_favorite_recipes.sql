-- Migration 012: Tạo bảng lưu trữ món ăn yêu thích của người dùng
-- Ngày thực hiện: 10/05/2026

CREATE TABLE IF NOT EXISTS scr_user_favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Giả định bảng users dùng UUID
    recipe_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại (Nếu Ngân đã có bảng users)
    -- CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Khóa ngoại liên kết tới bảng công thức
    CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES scr_recipes(id) ON DELETE CASCADE,
    
    -- Đảm bảo một người dùng không lưu trùng một món ăn nhiều lần
    CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_id)
);

-- Thêm index để truy vấn nhanh hơn
CREATE INDEX IF NOT EXISTS idx_favorite_user_id ON scr_user_favorite_recipes(user_id);
