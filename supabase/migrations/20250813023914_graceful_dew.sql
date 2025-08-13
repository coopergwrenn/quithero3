/*
  # AI Coaching Conversations

  1. New Tables
    - `ai_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `message_type` (text: user/assistant)
      - `content` (text)
      - `context_data` (jsonb) - user's quit data context
      - `created_at` (timestamp)
      - `session_id` (uuid) - groups related messages

  2. Security
    - Enable RLS on `ai_conversations` table
    - Add policy for users to read/write own conversations
*/

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content text NOT NULL,
  context_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON ai_conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_ai_conversations_user_session ON ai_conversations(user_id, session_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);