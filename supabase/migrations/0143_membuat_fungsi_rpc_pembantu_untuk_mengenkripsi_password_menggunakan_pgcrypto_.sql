CREATE OR REPLACE FUNCTION public.get_hashed_password(p_password text, p_salt text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
BEGIN
  RETURN extensions.crypt(p_password, p_salt);
END;
$function$;