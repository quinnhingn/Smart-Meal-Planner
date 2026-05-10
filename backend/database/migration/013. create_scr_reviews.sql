-- Migration 013: Tạo bảng lưu trữ đánh giá công thức từ người dùng
-- Ngày thực hiện: 10/05/2026

CREATE TABLE IF NOT EXISTS scr_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags JSONB DEFAULT '[]', -- Lưu các tag nhanh như ["Ngon", "Dễ làm"]
    images JSONB DEFAULT '[]', -- Lưu danh sách URL ảnh đánh giá
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại liên kết tới bảng công thức
    CONSTRAINT fk_review_recipe FOREIGN KEY (recipe_id) REFERENCES scr_recipes(id) ON DELETE CASCADE,
    
    -- Một người dùng chỉ được đánh giá một món ăn một lần (có thể cập nhật sau)
    CONSTRAINT unique_user_review_recipe UNIQUE (user_id, recipe_id)
);

-- Thêm index để truy vấn các đánh giá của một món ăn nhanh hơn
CREATE INDEX IF NOT EXISTS idx_review_recipe_id ON scr_reviews(recipe_id);
