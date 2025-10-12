-- Fix for missing profiles and foreign key constraint error
-- Run this in your Supabase SQL Editor

-- Step 1: Create profiles for any existing users that don't have one
INSERT INTO profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant necessary permissions (if needed)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 4: Verify - Check if any users are missing profiles
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN p.id IS NULL THEN 'Missing Profile'
    ELSE 'Has Profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- If any users show "Missing Profile", the first INSERT statement should fix them

