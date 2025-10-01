-- Add gender field to user_profiles table
-- This field will store the user's gender selection from onboarding

-- Add gender field to store user's gender (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
        ALTER TABLE user_profiles ADD COLUMN gender TEXT 
        CHECK (gender IN ('male', 'female'));
    END IF;
END $$;

-- Add index for gender field (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_gender') THEN
        CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);
    END IF;
END $$;

-- Add helpful comment
COMMENT ON COLUMN user_profiles.gender IS 'User gender selection from onboarding (male, female)';
