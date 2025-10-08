CREATE OR REPLACE FUNCTION public.get_student_borrowed_books_for_admin(p_id_nis text)
 RETURNS TABLE(id_sirkulasi integer, id_buku integer, tanggal_pinjam timestamp with time zone, tanggal_kembali timestamp with time zone, status text, judul_buku text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.id_sirkulasi,
    s.id_buku,
    s.tanggal_pinjam,
    s.tanggal_kembali,
    s.status,
    b.judul_buku
  FROM
    public.sirkulasi s
  LEFT JOIN
    public.buku b ON s.id_buku = b.id_buku
  WHERE
    s.id_nis = p_id_nis AND s.status = 'dipinjam';
END;
$function$