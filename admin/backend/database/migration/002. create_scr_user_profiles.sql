-- Migration 002: Create scr_user_profiles table
-- Chức năng: Lưu trữ hồ sơ sức khoẻ, mục tiêu và sở thích ăn uống cá nhân

CREATE TABLE IF NOT EXISTS scr_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES scr_users(id) ON DELETE CASCADE,
    gender VARCHAR(20),
    age INTEGER,
    height_cm FLOAT,
    weight_kg FLOAT,
    activity_level FLOAT,
    goal VARCHAR(50), -- 'lose_weight', 'maintain', 'gain_muscle'
    dietary_preference VARCHAR(100), -- 'vegetarian', 'vegan', 'keto', 'none'
    allergies JSONB DEFAULT '[]'::JSONB, -- Danh sách dị ứng dạng JSON array
    bmi FLOAT,
    tdee FLOAT,
    target_calories INTEGER,
    target_protein_g FLOAT,
    target_carbs_g FLOAT,
    target_fat_g FLOAT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu việc query profile từ user_id
CREATE INDEX IF NOT EXISTS idx_scr_user_profiles_user_id ON scr_user_profiles(user_id);
