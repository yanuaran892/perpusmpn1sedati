CREATE OR REPLACE FUNCTION public.set_config(key text, value text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM set_config(key, value, true); -- Mengubah false menjadi true untuk mengatur variabel sesi
END;
$function$;