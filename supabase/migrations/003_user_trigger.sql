-- ============================================================
-- 003_user_trigger.sql
-- Auto-create a public.users row when auth.users gets a new entry.
-- Reads role and club_id from raw_user_meta_data passed at signup.
-- Runs as SECURITY DEFINER so it bypasses RLS entirely.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, club_id, is_exec_approved)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'student'
    ),
    CASE
      WHEN NEW.raw_user_meta_data->>'club_id' IS NOT NULL
       AND NEW.raw_user_meta_data->>'club_id' != ''
      THEN (NEW.raw_user_meta_data->>'club_id')::uuid
      ELSE NULL
    END,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
