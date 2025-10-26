CREATE OR REPLACE FUNCTION public.get_total_student_circulation_count_v3(nis_input text)
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
  FROM public.sirkulasi
  WHERE id_nis = nis_input;

  RETURN total_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_total_student_circulation_count_v3(text) TO authenticated;