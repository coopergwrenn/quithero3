/*
  # Social Competition & Leaderboards

  1. New Tables
    - `leaderboard_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `anonymous_name` (text)
      - `leaderboard_type` (text: streak/savings/tools)
      - `score` (integer)
      - `rank` (integer)
      - `period` (text: daily/weekly/monthly/all-time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `peer_challenges`
      - `id` (uuid, primary key)
      - `challenger_id` (uuid, foreign key to users)
      - `challenged_id` (uuid, foreign key to users)
      - `challenge_type` (text: streak/savings/tools)
      - `target_value` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text: pending/active/completed/declined)
      - `winner_id` (uuid, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Leaderboards readable by all authenticated users
    - Challenges manageable by participants only
*/

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  anonymous_name text NOT NULL,
  leaderboard_type text NOT NULL CHECK (leaderboard_type IN ('streak', 'savings', 'tools')),
  score integer NOT NULL DEFAULT 0,
  rank integer,
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all-time')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS peer_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES users(id) ON DELETE CASCADE,
  challenged_id uuid REFERENCES users(id) ON DELETE CASCADE,
  challenge_type text NOT NULL CHECK (challenge_type IN ('streak', 'savings', 'tools')),
  target_value integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  winner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboards"
  ON leaderboard_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboard_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage challenges they participate in"
  ON peer_challenges
  FOR ALL
  TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE INDEX idx_leaderboard_type_period_rank ON leaderboard_entries(leaderboard_type, period, rank);
CREATE INDEX idx_peer_challenges_participants ON peer_challenges(challenger_id, challenged_id);