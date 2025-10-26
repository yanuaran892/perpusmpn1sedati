CREATE OR REPLACE FUNCTION public.get_total_student_circulation_count_v2(p_id_nis text)
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
  WHERE id_nis = p_id_nis;

  RETURN total_count;
END;
$function$;

COMMENT ON FUNCTION public.get_total_student_circulation_count_v2(text) IS 'Mengambil total jumlah entri sirkulasi untuk siswa tertentu.';