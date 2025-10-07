CREATE OR REPLACE FUNCTION public.get_admin_dashboard_circulation_data()
 RETURNS TABLE(id_sirkulasi integer, id_nis character varying, id_buku integer, tanggal_pinjam TIMESTAMP WITH TIME ZONE, tanggal_kembali date, tanggal_dikembalikan TIMESTAMP WITH TIME ZONE, status text, denda numeric, judul_buku text, siswa_nama character varying, siswa_kelas character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
    si.nama AS siswa_nama,
    si.kelas AS siswa_kelas
  FROM
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  LEFT JOIN
    public.siswa si ON s.id_nis = si.id_nis;
END;
$function$;