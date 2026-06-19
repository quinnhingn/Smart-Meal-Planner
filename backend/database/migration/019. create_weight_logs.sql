CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weight_user FOREIGN KEY (user_id) REFERENCES scr_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs (user_id, logged_at);
