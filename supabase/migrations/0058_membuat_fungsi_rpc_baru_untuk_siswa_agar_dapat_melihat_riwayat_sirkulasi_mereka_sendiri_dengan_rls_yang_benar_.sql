CREATE OR REPLACE FUNCTION public.get_student_circulation_history(p_id_nis text)
 RETURNS TABLE(
    id_sirkulasi integer,
    id_nis character varying,
    id_buku integer,
    tanggal_pinjam timestamp with time zone,
    tanggal_kembali date,
    tanggal_dikembalikan timestamp with time zone,
    status text,
    denda numeric,
    judul_buku text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Set app.current_nis for RLS policies that might be active even within SECURITY DEFINER functions
  PERFORM set_config('app.current_nis', p_id_nis, true);

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
    s.id_nis = p_id_nis -- Explicitly filter by p_id_nis
  ORDER BY s.tanggal_pinjam DESC;
END;
$function$;