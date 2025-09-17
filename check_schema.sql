-- Query to check what tables and columns exist in your database
-- Run this in your Supabase SQL Editor

-- 1. List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if user_profiles table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check if users table exists and what columns it has  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Count records in each table (if they exist)
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')

UNION ALL

SELECT 
  'user_profiles' as table_name,
  COUNT(*) as record_count  
FROM user_profiles
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public');
