-- ============================================================
-- 004_add_email_to_users.sql
-- Store email in public.users so admins can see it without
-- needing direct access to auth.users.
-- ============================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;

-- Backfill existing rows from auth.users
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id;

-- Update trigger to also capture email on new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, club_id, is_exec_approved)
  VALUES (
    NEW.id,
    NEW.email,
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
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;
