CREATE OR REPLACE FUNCTION public.login_siswa(id_nis_param text, password_param text)
 RETURNS SETOF siswa
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
BEGIN
  -- Set app.current_nis for RLS policies that might be active even within SECURITY DEFINER functions
  PERFORM set_config('app.current_nis', id_nis_param, true); -- Changed from false to true for session persistence

  RETURN QUERY
  SELECT
    s.*
  FROM public.siswa s
  WHERE
    s.id_nis = id_nis_param AND s.password = crypt(password_param, s.password);
END;
$function$;