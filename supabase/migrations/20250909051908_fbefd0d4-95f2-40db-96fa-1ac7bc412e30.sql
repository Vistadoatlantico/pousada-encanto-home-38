-- Ensure trigger exists to auto-create profiles on new auth users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- Grant admin to the specified email if the user exists
WITH u AS (
  SELECT id AS user_id, email
  FROM auth.users
  WHERE email = 'vistadiretoria@gmail.com'
  LIMIT 1
), upsert AS (
  UPDATE public.profiles p
  SET is_admin = true,
      email = u.email,
      updated_at = now()
  FROM u
  WHERE p.user_id = u.user_id
  RETURNING p.user_id
)
INSERT INTO public.profiles (user_id, email, is_admin)
SELECT u.user_id, u.email, true
FROM u
WHERE NOT EXISTS (SELECT 1 FROM upsert);
