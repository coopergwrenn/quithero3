-- Add quit_date field to user_profiles table
-- This field will store when the user actually quit (if they already have)

-- Add quit_date field to store user's actual quit date (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'quit_date') THEN
        ALTER TABLE user_profiles ADD COLUMN quit_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add already_quit field to store if user has already quit (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'already_quit') THEN
        ALTER TABLE user_profiles ADD COLUMN already_quit TEXT 
        CHECK (already_quit IN ('yes', 'no'));
    END IF;
END $$;

-- Add indexes for quit_date fields (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_quit_date') THEN
        CREATE INDEX idx_user_profiles_quit_date ON user_profiles(quit_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_already_quit') THEN
        CREATE INDEX idx_user_profiles_already_quit ON user_profiles(already_quit);
    END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN user_profiles.quit_date IS 'Actual date when user quit (if they already have)';
COMMENT ON COLUMN user_profiles.already_quit IS 'Whether user has already quit (yes, no)';
