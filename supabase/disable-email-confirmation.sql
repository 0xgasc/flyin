-- Disable email confirmation for easier development
-- Run this in your Supabase SQL Editor

-- Update auth configuration to disable email confirmation
UPDATE auth.config 
SET enable_signup = true,
    enable_confirmations = false,
    enable_recoveries = true
WHERE id = 1;

-- If the above doesn't work, you can also disable it via the dashboard:
-- Go to Authentication > Settings > Email confirmations > Turn OFF "Enable email confirmations"

-- You can also check the current settings:
SELECT * FROM auth.config;