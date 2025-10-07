CREATE OR REPLACE FUNCTION public.get_student_fine_payments(
  p_id_nis TEXT
)
RETURNS TABLE(
  id_pembayaran INTEGER,
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
  -- Ensure the student is authenticated and matches the provided NIS
  IF current_setting('app.current_nis'::text, true) IS NULL OR current_setting('app.current_nis'::text, true) <> p_id_nis THEN
    RAISE EXCEPTION 'Unauthorized: NIS does not match authenticated student.';
  END IF;

  RETURN QUERY
  SELECT
    pd.id_pembayaran,
    pd.jumlah_bayar,
    pd.tanggal_bayar,
    pd.status_pembayaran,
    pd.bukti_pembayaran_url,
    pd.created_at
  FROM
    public.pembayaran_denda pd
  WHERE
    pd.id_nis = p_id_nis
  ORDER BY pd.created_at DESC;
END;
$$;