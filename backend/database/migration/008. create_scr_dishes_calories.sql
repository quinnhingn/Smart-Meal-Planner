-- 1. Tạo bảng trống
CREATE TABLE IF NOT EXISTS scr_dishes_calories (
    id              SERIAL PRIMARY KEY,
    recipe_id       INTEGER NOT NULL UNIQUE REFERENCES scr_recipes(id) ON DELETE CASCADE,
    calories        FLOAT DEFAULT 0,
    protein         FLOAT DEFAULT 0,
    carbs           FLOAT DEFAULT 0,
    fat             FLOAT DEFAULT 0,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Đẩy đúng 3 món hiện có qua (Bò kho, Salad, Bánh giò)
INSERT INTO scr_dishes_calories (recipe_id, calories, protein, carbs, fat)
SELECT id, total_calories, total_protein, total_carbs, total_fat 
FROM scr_recipes;

-- 3. Xoá cột cũ bên bảng recipe cho nhẹ nợ
ALTER TABLE scr_recipes DROP COLUMN IF EXISTS total_calories;
ALTER TABLE scr_recipes DROP COLUMN IF EXISTS total_protein;
ALTER TABLE scr_recipes DROP COLUMN IF EXISTS total_carbs;
ALTER TABLE scr_recipes DROP COLUMN IF EXISTS total_fat;
