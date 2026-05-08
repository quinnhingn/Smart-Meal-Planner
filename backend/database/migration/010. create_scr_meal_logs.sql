-- Migration 011: Tạo bảng scr_meal_logs để lưu nhật ký ăn uống hằng ngày
-- Ngày tạo: 09/05/2026

CREATE TABLE IF NOT EXISTS scr_meal_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES scr_users(id) ON DELETE CASCADE,
    
    -- Liên kết với công thức (nếu có)
    recipe_id           INTEGER REFERENCES scr_recipes(id) ON DELETE SET NULL,
    
    meal_name           VARCHAR(255) NOT NULL,
    
    -- Loại bữa ăn: breakfast, lunch, dinner, snack
    meal_type           VARCHAR(50) NOT NULL,
    
    -- Số phần đã ăn (ví dụ: 1 phần, 0.5 phần, 2 phần)
    servings            FLOAT DEFAULT 1.0,
    
    -- Thông số dinh dưỡng THỰC TẾ đã nạp (sau khi nhân với servings)
    -- Tại sao copy cứng? Để nếu admin sửa calo nguyên liệu thì nhật ký cũ của user không bị thay đổi.
    calories_consumed   FLOAT NOT NULL,
    protein_g           FLOAT,
    fat_g               FLOAT,
    carbs_g             FLOAT,
    
    eaten_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm theo ngày và theo user nhanh hơn cho biểu đồ
CREATE INDEX IF NOT EXISTS idx_scr_meal_logs_user_date ON scr_meal_logs(user_id, eaten_at);
