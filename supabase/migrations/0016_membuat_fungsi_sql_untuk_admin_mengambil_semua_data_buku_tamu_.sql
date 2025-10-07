CREATE OR REPLACE FUNCTION public.get_admin_dashboard_guest_book_data()
 RETURNS SETOF buku_tamu
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY SELECT * FROM public.buku_tamu;
END;
$function$;