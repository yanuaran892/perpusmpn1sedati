CREATE OR REPLACE FUNCTION public.get_total_admin_circulation_count(
    searchkey text DEFAULT '',
    filter_status text DEFAULT 'all'
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
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  LEFT JOIN
    public.siswa si ON s.id_nis = si.id_nis
  WHERE
    (searchkey = '' OR b.judul_buku ILIKE '%' || searchkey || '%' OR si.nama ILIKE '%' || searchkey || '%' OR s.id_nis ILIKE '%' || searchkey || '%')
    AND (filter_status = 'all' OR s.status = filter_status);
  RETURN total_count;
END;
$function$;