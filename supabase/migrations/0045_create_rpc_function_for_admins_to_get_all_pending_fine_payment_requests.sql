CREATE OR REPLACE FUNCTION public.get_pending_fine_payments_for_admin()
RETURNS TABLE(
  id_pembayaran INTEGER,
  id_nis VARCHAR,
  siswa_nama VARCHAR,
  siswa_kelas VARCHAR,
  jumlah_bayar NUMERIC,
  tanggal_bayar TIMESTAMP WITH TIME ZONE,
  status_pembayaran TEXT,
  bukti_pembayaran_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.id_pembayaran,
    pd.id_nis,
    s.nama AS siswa_nama,
    s.kelas AS siswa_kelas,
    pd.jumlah_bayar,
    pd.tanggal_bayar,
    pd.status_pembayaran,
    pd.bukti_pembayaran_url,
    pd.created_at
  FROM
    public.pembayaran_denda pd
  LEFT JOIN
    public.siswa s ON pd.id_nis = s.id_nis
  WHERE
    pd.status_pembayaran = 'pending'
  ORDER BY pd.created_at ASC;
END;
$$;