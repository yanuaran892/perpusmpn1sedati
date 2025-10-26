CREATE OR REPLACE FUNCTION public.get_student_circulation_history_v2(
    limit_value integer,
    offset_value integer,
    p_id_nis text
)
 RETURNS TABLE(id_sirkulasi integer, id_nis character varying, id_buku integer, tanggal_pinjam timestamp with time zone, tanggal_kembali timestamp with time zone, tanggal_dikembalikan timestamp with time zone, status text, denda numeric, judul_buku text, jumlah_perpanjangan integer, tanggal_kembali_request timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  current_nis_setting text;
BEGIN
  RAISE NOTICE 'get_student_circulation_history_v2 called with p_id_nis: %, limit: %, offset: %', p_id_nis, limit_value, offset_value;

  current_nis_setting := current_setting('app.current_nis'::text, true);
  RAISE NOTICE 'Inside get_student_circulation_history_v2: app.current_nis from session: %', current_nis_setting;

  RETURN QUERY
  SELECT
    s.id_sirkulasi,
    s.id_nis,
    s.id_buku,
    s.tanggal_pinjam,
    s.tanggal_kembali,
    s.tanggal_dikembalikan,
    s.status,
    s.denda,
    b.judul_buku,
    s.jumlah_perpanjangan,
    s.tanggal_kembali_request
  FROM
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  WHERE
    s.id_nis = p_id_nis
  ORDER BY s.tanggal_pinjam DESC
  LIMIT limit_value
  OFFSET offset_value;
END;
$function$;