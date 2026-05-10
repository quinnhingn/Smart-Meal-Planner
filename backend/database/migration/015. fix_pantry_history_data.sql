-- Sửa lại dữ liệu lịch sử cho Ngân (nạp cho tất cả User hiện có)
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
