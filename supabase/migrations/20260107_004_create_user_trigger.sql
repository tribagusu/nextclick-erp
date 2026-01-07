-- Migration: Create user on auth signup
-- This trigger automatically creates a user record in the public.users table
-- when a new user signs up and confirms their email

-- Drop existing triggers and functions first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_confirmed();

-- Add policy to allow service_role to insert users (for trigger)
-- This bypasses regular RLS for the auth trigger
DROP POLICY IF EXISTS users_insert_service ON users;
CREATE POLICY users_insert_service ON users
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Function to handle new user creation
-- Uses SECURITY DEFINER to run as the function owner (postgres)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'employee'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Alter function owner to postgres to ensure SECURITY DEFINER works
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Trigger to run after auth.users insert (new signup)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
