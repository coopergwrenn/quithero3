-- Remove the redundant users table since we have user_profiles with all the data
-- The auth.users table (managed by Supabase) handles authentication
-- The user_profiles table handles all app-specific data

-- Drop the redundant users table
DROP TABLE IF EXISTS users CASCADE;

-- Success message
SELECT 'SUCCESS: Removed redundant users table. Clean database structure!' as result;
