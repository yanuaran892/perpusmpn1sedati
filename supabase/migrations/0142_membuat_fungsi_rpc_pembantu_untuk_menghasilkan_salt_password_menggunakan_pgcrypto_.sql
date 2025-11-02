CREATE OR REPLACE FUNCTION public.get_salt(p_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
BEGIN
  RETURN extensions.gen_salt(p_type);
END;
$function$;