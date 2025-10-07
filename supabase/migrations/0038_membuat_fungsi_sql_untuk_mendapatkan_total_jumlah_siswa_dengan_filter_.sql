CREATE OR REPLACE FUNCTION public.get_total_siswa_count(
    searchkey text DEFAULT ''::text,
    filter_class text DEFAULT 'all'::text,
    filter_status_siswa text DEFAULT 'all'::text,
    filter_borrowing_status text DEFAULT 'all'::text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  total_count integer;
BEGIN
  SELECT
    COUNT(*)::integer INTO total_count
  FROM
    public.siswa s
  WHERE
    (searchkey = '' OR s.nama ILIKE '%' || searchkey || '%' OR s.id_nis ILIKE '%' || searchkey || '%' OR s.email ILIKE '%' || searchkey || '%')
    AND (filter_class = 'all' OR s.kelas = filter_class)
    AND (filter_status_siswa = 'all' OR s.status_siswa = filter_status_siswa)
    AND (
        (filter_borrowing_status = 'all') OR
        (filter_borrowing_status = 'sedang_meminjam' AND s.sedang_pinjam > 0) OR
        (filter_borrowing_status = 'tidak_meminjam' AND s.sedang_pinjam = 0)
    );
  RETURN total_count;
END;
$function$;