CREATE OR REPLACE FUNCTION public.get_all_siswa_for_admin()
RETURNS SETOF public.siswa
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.siswa;
END;
$$;