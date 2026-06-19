ALTER TABLE daily_workouts ADD COLUMN progress_data JSONB DEFAULT '{}'::jsonb;
