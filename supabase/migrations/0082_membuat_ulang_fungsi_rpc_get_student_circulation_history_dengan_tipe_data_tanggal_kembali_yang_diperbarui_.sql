CREATE OR REPLACE FUNCTION public.get_student_circulation_history(p_id_nis text)
 RETURNS TABLE(id_sirkulasi integer, id_nis character varying, id_buku integer, tanggal_pinjam timestamp with time zone, tanggal_kembali timestamp with time zone, tanggal_dikembalikan timestamp with time zone, status text, denda numeric, judul_buku text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  current_nis_setting text;
BEGIN
  RAISE NOTICE 'get_student_circulation_history called with p_id_nis: %', p_id_nis;

  -- Rely on app.current_nis being set by login_siswa for the session
  current_nis_setting := current_setting('app.current_nis'::text, true);
  RAISE NOTICE 'Inside get_student_circulation_history: app.current_nis from session: %', current_nis_setting;

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
    b.judul_buku
  FROM
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  WHERE
    s.id_nis = p_id_nis
  ORDER BY s.tanggal_pinjam DESC;
END;
$function$