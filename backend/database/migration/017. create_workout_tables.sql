-- 1. Table for Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    goal VARCHAR(255),
    difficulty VARCHAR(50),
    total_days INT DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workout_plan_user FOREIGN KEY (user_id) REFERENCES scr_users(id) ON DELETE CASCADE
);

-- 2. Table for Daily Workouts
CREATE TABLE IF NOT EXISTS daily_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    day_number INT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    title VARCHAR(255),
    duration_minutes INT DEFAULT 0,
    calories INT DEFAULT 0,
    exercises_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_daily_workout_plan FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_workouts_plan_id ON daily_workouts(plan_id);
