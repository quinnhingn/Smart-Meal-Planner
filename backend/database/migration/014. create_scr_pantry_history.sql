-- Bảng Lịch sử sử dụng nguyên liệu (Nấu ăn, Vứt bỏ, Thêm mới)
CREATE TABLE IF NOT EXISTS scr_pantry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit VARCHAR(50),
    action_type VARCHAR(50), -- 'consumed', 'discarded', 'added'
    recipe_id INTEGER NULL,   -- Khóa ngoại tới bảng công thức
    recipe_name VARCHAR(255),
    action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Thêm dữ liệu "nấu bù" cho Ngân món Nghêu hấp sả gừng
-- Tìm đúng ID của món Nghêu hấp sả gừng trong database
INSERT INTO scr_pantry_history (user_id, ingredient_name, quantity, unit, action_type, recipe_id, recipe_name)
SELECT 
    u.id, 
    'Nghêu', 1, 'kg', 'consumed', 
    r.id, r.name_vn
FROM scr_users u, scr_recipes r
WHERE r.name_vn ILIKE '%Nghêu hấp sả%';

INSERT INTO scr_pantry_history (user_id, ingredient_name, quantity, unit, action_type, recipe_id, recipe_name)
SELECT 
    u.id, 
    'Gừng', 1, 'củ', 'consumed', 
    r.id, r.name_vn
FROM scr_users u, scr_recipes r
WHERE r.name_vn ILIKE '%Nghêu hấp sả%';
