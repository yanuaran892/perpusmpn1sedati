CREATE OR REPLACE FUNCTION public.get_paginated_siswa(
    limit_value integer,
    offset_value integer,
    searchkey text DEFAULT ''::text,
    filter_class text DEFAULT 'all'::text,
    filter_status_siswa text DEFAULT 'all'::text,
    filter_borrowing_status text DEFAULT 'all'::text
)
RETURNS SETOF siswa
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.*
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
    )
  ORDER BY s.nama ASC
  LIMIT limit_value
  OFFSET offset_value;
END;
$function$;