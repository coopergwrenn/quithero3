/*
  # Create community posts table for QuitHero

  1. New Tables
    - `community_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `content` (text, not null)
      - `anonymous_name` (text, not null)
      - `streak_days` (integer, default 0)
      - `post_type` (text, check constraint for milestone/struggle/tip/celebration)
      - `likes_count` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `community_posts` table
    - Add policies for authenticated users to read all posts
    - Add policies for users to manage their own posts
*/

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  anonymous_name text NOT NULL,
  streak_days integer DEFAULT 0,
  post_type text DEFAULT 'tip' CHECK (post_type IN ('milestone', 'struggle', 'tip', 'celebration')),
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read community posts
CREATE POLICY "Anyone can read community posts"
  ON community_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
  ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON community_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON community_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);