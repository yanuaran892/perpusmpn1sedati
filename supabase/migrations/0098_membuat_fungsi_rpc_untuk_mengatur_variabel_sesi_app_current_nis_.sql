CREATE OR REPLACE FUNCTION public.set_student_session_nis(p_id_nis text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
BEGIN
  PERFORM set_config('app.current_nis', p_id_nis, true);
END;
$$;