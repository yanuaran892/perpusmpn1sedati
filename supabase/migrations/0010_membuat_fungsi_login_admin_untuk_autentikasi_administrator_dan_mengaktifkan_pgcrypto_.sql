CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.login_admin(p_username text, p_password text)
 RETURNS SETOF public.admin
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    a.*
  FROM public.admin a
  WHERE
    a.username = p_username AND a.password = crypt(p_password, a.password);
END;
$function$;