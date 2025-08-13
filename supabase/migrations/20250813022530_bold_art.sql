/*
  # Create tool usage table for QuitHero

  1. New Tables
    - `tool_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tool_type` (text, not null)
      - `duration` (integer, nullable - in seconds)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tool_usage` table
    - Add policies for users to manage their own tool usage data

  3. Indexes
    - Index on user_id for efficient user queries
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tool_type text NOT NULL,
  duration integer,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tool usage
CREATE POLICY "Users can insert own tool usage"
  ON tool_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own tool usage
CREATE POLICY "Users can read own tool usage"
  ON tool_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at ON tool_usage(created_at DESC);