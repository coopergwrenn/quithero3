/*
  # Financial Incentives System

  1. New Tables
    - `deposit_contracts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount` (decimal)
      - `commitment_days` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text: active/completed/failed/refunded)
      - `penalty_amount` (decimal)
      - `created_at` (timestamp)

    - `savings_challenges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `challenge_type` (text: daily/weekly/monthly)
      - `target_amount` (decimal)
      - `current_amount` (decimal)
      - `start_date` (date)
      - `end_date` (date)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own financial data
*/

CREATE TABLE IF NOT EXISTS deposit_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  commitment_days integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'refunded')),
  penalty_amount decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savings_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  challenge_type text NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deposit_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deposit contracts"
  ON deposit_contracts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own savings challenges"
  ON savings_challenges
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_deposit_contracts_user_status ON deposit_contracts(user_id, status);
CREATE INDEX idx_savings_challenges_user_active ON savings_challenges(user_id, completed);