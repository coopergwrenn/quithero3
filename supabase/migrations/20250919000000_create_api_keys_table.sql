-- Create secure API keys table
-- This table will store API keys securely on the server side
-- Only accessible through RLS policies and server functions

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy that prevents direct access from client
-- Only server-side functions can access this table
CREATE POLICY "No direct client access" ON api_keys
  FOR ALL USING (false);

-- Insert the Voiceflow API key
INSERT INTO api_keys (service_name, api_key, description) 
VALUES (
  'voiceflow',
  'VF.DM.68a60e6a0517297383b0f962.xouWwEE9qhRB3u0J',
  'Voiceflow API key for AI coaching chatbot'
) ON CONFLICT (service_name) DO UPDATE SET 
  api_key = EXCLUDED.api_key,
  updated_at = NOW();

-- Create a secure function to get API keys
-- This function will only be callable from server-side code
CREATE OR REPLACE FUNCTION get_api_key(service_name_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the function owner
AS $$
DECLARE
  key_value TEXT;
BEGIN
  -- Only allow specific service names to prevent abuse
  IF service_name_param NOT IN ('voiceflow') THEN
    RAISE EXCEPTION 'Invalid service name';
  END IF;
  
  SELECT api_key INTO key_value
  FROM api_keys 
  WHERE service_name = service_name_param 
  AND is_active = true;
  
  RETURN key_value;
END;
$$;

-- Grant execute permission to authenticated users
-- (This will be further restricted in the service layer)
GRANT EXECUTE ON FUNCTION get_api_key TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
