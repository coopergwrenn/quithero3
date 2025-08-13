/*
  # Create user streaks table for QuitHero

  1. New Tables
    - `user_streaks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `streak_type` (text, check constraint for quit/pledge/tool_usage)
      - `current_streak` (integer, default 0)
      - `best_streak` (integer, default 0)
      - `last_activity` (timestamp, default now())
      - Unique constraint on (user_id, streak_type)

  2. Security
    - Enable RLS on `user_streaks` table
    - Add policies for users to manage their own streaks
*/

CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  streak_type text NOT NULL CHECK (streak_type IN ('quit', 'pledge', 'tool_usage')),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own streaks
CREATE POLICY "Users can manage own streaks"
  ON user_streaks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read their own streaks
CREATE POLICY "Users can read own streaks"
  ON user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);