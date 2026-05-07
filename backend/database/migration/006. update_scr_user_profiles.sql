-- Migration 006: Update scr_user_profiles table
-- Chức năng: Thêm các trường mới từ luồng Onboarding đã cập nhật
-- Bao gồm: cân nặng mục tiêu, tạng người, tốc độ, dislikes, thời gian dự kiến

-- Cân nặng mục tiêu (kg) - để tính lộ trình thay đổi thể trạng
ALTER TABLE scr_user_profiles
    ADD COLUMN IF NOT EXISTS target_weight_kg FLOAT;

-- Tạng người: 'ectomorph' (gầy), 'mesomorph' (cân đối), 'endomorph' (tròn trịa)
-- Dùng để cá nhân hóa tỷ lệ Macro (đạm/béo/bột)
ALTER TABLE scr_user_profiles
    ADD COLUMN IF NOT EXISTS body_type VARCHAR(20) DEFAULT 'mesomorph';

-- Tốc độ đạt mục tiêu: 'slow', 'normal', 'fast'
-- Dùng để tính mức thâm hụt/dư thừa calo phù hợp
ALTER TABLE scr_user_profiles
    ADD COLUMN IF NOT EXISTS pace VARCHAR(20) DEFAULT 'normal';

-- Danh sách thực phẩm không thích (khác với dị ứng - không gây nguy hiểm)
-- Ví dụ: ["cilantro", "bitter_melon", "onion"]
ALTER TABLE scr_user_profiles
    ADD COLUMN IF NOT EXISTS dislikes JSONB DEFAULT '[]'::JSONB;

-- Số tuần dự kiến đạt mục tiêu (tính tự động từ công thức)
ALTER TABLE scr_user_profiles
    ADD COLUMN IF NOT EXISTS estimated_weeks INTEGER DEFAULT 0;
