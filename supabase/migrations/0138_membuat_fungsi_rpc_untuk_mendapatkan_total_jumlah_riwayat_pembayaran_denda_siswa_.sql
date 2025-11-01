CREATE OR REPLACE FUNCTION public.get_total_student_fine_payments_count(
    p_id_nis text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  total_count integer;
BEGIN
  SELECT COUNT(*)::integer
  INTO total_count
  FROM public.pembayaran_denda
  WHERE id_nis = p_id_nis;

  RETURN total_count;
END;
$function$;