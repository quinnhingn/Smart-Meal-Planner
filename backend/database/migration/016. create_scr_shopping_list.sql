-- Bảng Danh sách đi chợ (Shopping List / Cart)
CREATE TABLE IF NOT EXISTS scr_shopping_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit VARCHAR(50),
    recipe_id INTEGER NULL,
    is_bought BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm nhanh theo user
CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON scr_shopping_list(user_id);
