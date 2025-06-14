
-- First, let's check if all our tables exist and drop/recreate the trigger with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler version of the trigger function first to test basic functionality
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
  
  -- Only try to create sample data if this is the admin user and profile was created successfully
  IF NEW.email = 'admin@taskflow.com' THEN
    BEGIN
      PERFORM create_sample_data_for_user(NEW.id);
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't block user creation
        RAISE WARNING 'Error creating sample data for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Make sure RLS policies allow the profile creation
-- Add a policy that allows inserting profiles during user creation
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
