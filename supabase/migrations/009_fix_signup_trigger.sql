-- ═══════════════════════════════════════════════
-- Fix: handle_new_user() trigger failing on signup
-- ═══════════════════════════════════════════════
-- Error: "Database error saving new user"
--
-- Root cause: The SECURITY DEFINER function lacked SET search_path,
-- which is required for PostgreSQL to reliably resolve table names
-- when the function runs in the Supabase Auth (GoTrue) context.
-- Without it, the INSERT into profiles can fail silently.
--
-- Fix:
--   1. Add SET search_path = public
--   2. Use fully qualified public.profiles reference
--   3. Add ON CONFLICT DO NOTHING for idempotency
--   4. Wrap in exception handler as safety net

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log but don't block signup — ensureProfileExists() will retry
    RAISE WARNING 'handle_new_user trigger failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it points to the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
