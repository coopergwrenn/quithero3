/*
  # Create users table for QuitHero

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `apple_id` (text, unique, nullable)
      - `created_at` (timestamp)
      - `quit_date` (date, nullable)
      - `risk_level` (text, check constraint for high/medium/low)
      - `motivation` (text, nullable)
      - `substance_type` (text, check constraint for cigarettes/vape/both)
      - `usage_amount` (integer, nullable)
      - `triggers` (text array, nullable)
      - `streak_days` (integer, default 0)
      - `total_saved` (numeric, default 0)
      - `last_active` (timestamp, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  apple_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  quit_date date,
  risk_level text CHECK (risk_level IN ('high', 'medium', 'low')),
  motivation text,
  substance_type text CHECK (substance_type IN ('cigarettes', 'vape', 'both')),
  usage_amount integer,
  triggers text[],
  streak_days integer DEFAULT 0,
  total_saved numeric DEFAULT 0,
  last_active timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can insert their own data (for signup)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);