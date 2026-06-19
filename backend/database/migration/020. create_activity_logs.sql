CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES scr_users(id),
    activity_name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
