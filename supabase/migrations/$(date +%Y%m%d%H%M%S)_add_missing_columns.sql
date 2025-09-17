-- Add missing columns to existing user_profiles table
-- This adds only the columns that don't exist yet

-- Add email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add signup_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'signup_method') THEN
        ALTER TABLE user_profiles ADD COLUMN signup_method TEXT 
        CHECK (signup_method IN ('email', 'google', 'phone', 'apple'));
    END IF;
END $$;

-- Add indexes safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_email') THEN
        CREATE INDEX idx_user_profiles_email ON user_profiles(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_signup_method') THEN
        CREATE INDEX idx_user_profiles_signup_method ON user_profiles(signup_method);
    END IF;
END $$;

-- Success message
SELECT 'SUCCESS: Added email and signup_method columns to user_profiles!' as result;
