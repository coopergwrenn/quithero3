-- Add nrt_interest field to user_profiles table
-- This field will store the user's interest in nicotine replacement therapy from onboarding

-- Add nrt_interest field to store user's NRT interest (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'nrt_interest') THEN
        ALTER TABLE user_profiles ADD COLUMN nrt_interest TEXT 
        CHECK (nrt_interest IN ('yes', 'maybe', 'no', 'already-using'));
    END IF;
END $$;

-- Add index for nrt_interest field (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_nrt_interest') THEN
        CREATE INDEX idx_user_profiles_nrt_interest ON user_profiles(nrt_interest);
    END IF;
END $$;

-- Add helpful comment
COMMENT ON COLUMN user_profiles.nrt_interest IS 'User interest in nicotine replacement therapy from onboarding (yes, maybe, no, already-using)';
