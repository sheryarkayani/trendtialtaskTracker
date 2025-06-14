
-- Mark the existing admin@taskflow.com user as confirmed
-- Only update email_confirmed_at as confirmed_at is a generated column
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'admin@taskflow.com' 
  AND email_confirmed_at IS NULL;
