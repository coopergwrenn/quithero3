/*
  # NRT Medication Tracking

  1. New Tables
    - `nrt_medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `medication_type` (text: patch/gum/lozenge/inhaler/nasal-spray)
      - `dosage` (text)
      - `schedule` (jsonb) - dosing schedule
      - `start_date` (date)
      - `end_date` (date)
      - `active` (boolean)
      - `created_at` (timestamp)

    - `nrt_doses`
      - `id` (uuid, primary key)
      - `medication_id` (uuid, foreign key)
      - `scheduled_time` (timestamp)
      - `taken_time` (timestamp, nullable)
      - `skipped` (boolean)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own medication data
*/

CREATE TABLE IF NOT EXISTS nrt_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  medication_type text NOT NULL CHECK (medication_type IN ('patch', 'gum', 'lozenge', 'inhaler', 'nasal-spray')),
  dosage text NOT NULL,
  schedule jsonb NOT NULL DEFAULT '{}',
  start_date date NOT NULL,
  end_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nrt_doses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES nrt_medications(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  taken_time timestamptz,
  skipped boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nrt_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nrt_doses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medications"
  ON nrt_medications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own doses"
  ON nrt_doses
  FOR ALL
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM nrt_medications WHERE id = medication_id));

CREATE INDEX idx_nrt_medications_user_active ON nrt_medications(user_id, active);
CREATE INDEX idx_nrt_doses_scheduled_time ON nrt_doses(scheduled_time);