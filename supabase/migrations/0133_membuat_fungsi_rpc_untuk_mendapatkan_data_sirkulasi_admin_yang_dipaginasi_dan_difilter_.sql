CREATE OR REPLACE FUNCTION public.get_paginated_admin_circulation_data(
    limit_value integer,
    offset_value integer,
    searchkey text DEFAULT '',
    filter_status text DEFAULT 'all'
)
RETURNS TABLE(
    id_sirkulasi integer,
    id_nis character varying,
    id_buku integer,
    tanggal_pinjam timestamp with time zone,
    tanggal_kembali timestamp with time zone,
    tanggal_dikembalikan timestamp with time zone,
    status text,
    denda numeric,
    judul_buku text,
    siswa_nama character varying,
    siswa_kelas character varying,
    jumlah_perpanjangan integer,
    tanggal_kembali_request timestamp with time zone
)
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
    si.kelas AS siswa_kelas,
    s.jumlah_perpanjangan,
    s.tanggal_kembali_request
  FROM
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  LEFT JOIN
    public.siswa si ON s.id_nis = si.id_nis
  WHERE
    (searchkey = '' OR b.judul_buku ILIKE '%' || searchkey || '%' OR si.nama ILIKE '%' || searchkey || '%' OR s.id_nis ILIKE '%' || searchkey || '%')
    AND (filter_status = 'all' OR s.status = filter_status)
  ORDER BY s.id_sirkulasi DESC
  LIMIT limit_value
  OFFSET offset_value;
END;
$function$;