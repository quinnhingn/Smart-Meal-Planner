-- Migration 007: Update scr_users table
-- Chức năng: Thêm trường tên hiển thị (display name) cho người dùng

-- Tên hiển thị của người dùng, không bắt buộc unique
-- Ví dụ: "Nguyễn Văn A", "Ngân Lê"
ALTER TABLE scr_users
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);
