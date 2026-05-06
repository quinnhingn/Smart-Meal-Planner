-- Migration 005: Cập nhật các cột còn thiếu cho bảng scr_recipes
-- Ngày thực hiện: 06/05/2026

ALTER TABLE scr_recipes 
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50),
ADD COLUMN IF NOT EXISTS cooking_time VARCHAR(100),
ADD COLUMN IF NOT EXISTS servings VARCHAR(100);
