-- Create user_profiles table to store onboarding data
-- Phase 4A: Supabase Data Persistence for Onboarding Profile

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Badge and Identity
  badge_type TEXT NOT NULL CHECK (badge_type IN ('VapeBreaker', 'CloudWarrior', 'LifeGuardian', 'WealthBuilder')),
  badge_display_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dependency Scoring
  dependency_total INTEGER NOT NULL CHECK (dependency_total >= 0 AND dependency_total <= 100),
  dependency_risk_level TEXT NOT NULL CHECK (dependency_risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
  dependency_risk_description TEXT NOT NULL,
  
  -- Dependency Breakdown
  morning_dependency_score INTEGER DEFAULT 0,
  usage_frequency_score INTEGER DEFAULT 0,
  behavioral_compulsion_score INTEGER DEFAULT 0,
  environmental_factors_score INTEGER DEFAULT 0,
  struggle_count_score INTEGER DEFAULT 0,
  
  -- Onboarding Responses
  motivation TEXT NOT NULL,
  device_type TEXT,
  usage_frequency TEXT,
  first_use_time TEXT,
  choice_vs_need TEXT,
  triggers TEXT[], -- Array of trigger IDs
  selected_struggles TEXT[], -- Array of struggle IDs
  social_context TEXT,
  stress_level TEXT,
  sleep_quality TEXT,
  previous_attempts TEXT,
  quit_timeline TEXT,
  support_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own profile
CREATE POLICY "Users can access their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_badge_type ON user_profiles(badge_type);
CREATE INDEX idx_user_profiles_dependency_risk ON user_profiles(dependency_risk_level);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Add helpful comments
COMMENT ON TABLE user_profiles IS 'Complete psychological profiles from QUITTR-style onboarding including badges, dependency scoring, and all response data';
COMMENT ON COLUMN user_profiles.badge_type IS 'Badge identity assigned based on motivation (VapeBreaker, CloudWarrior, LifeGuardian, WealthBuilder)';
COMMENT ON COLUMN user_profiles.dependency_total IS 'Total dependency score from 0-100 calculated from onboarding responses';
COMMENT ON COLUMN user_profiles.dependency_risk_level IS 'Risk classification: Low, Moderate, High, Critical';
COMMENT ON COLUMN user_profiles.triggers IS 'Array of trigger IDs that cause vaping urges';
COMMENT ON COLUMN user_profiles.selected_struggles IS 'Array of struggle area IDs from onboarding';
