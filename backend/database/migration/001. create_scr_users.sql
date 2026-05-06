-- Migration 001: Create scr_users table
-- Chức năng: Lưu trữ thông tin đăng nhập và phân quyền (Auth)

CREATE TABLE IF NOT EXISTS scr_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'user' hoặc 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm email nhanh hơn lúc đăng nhập
CREATE INDEX IF NOT EXISTS idx_scr_users_email ON scr_users(email);
