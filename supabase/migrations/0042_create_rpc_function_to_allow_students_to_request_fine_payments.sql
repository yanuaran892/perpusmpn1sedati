CREATE OR REPLACE FUNCTION public.request_fine_payment(
  p_id_nis TEXT,
  p_jumlah_bayar NUMERIC,
  p_bukti_pembayaran_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
BEGIN
  -- Ensure the student is authenticated and matches the provided NIS
  IF current_setting('app.current_nis'::text, true) IS NULL OR current_setting('app.current_nis'::text, true) <> p_id_nis THEN
    RAISE EXCEPTION 'Unauthorized: NIS does not match authenticated student.';
  END IF;

  -- Check if the student has enough total_denda to cover the payment
  IF (SELECT total_denda FROM public.siswa WHERE id_nis = p_id_nis) < p_jumlah_bayar THEN
    RAISE EXCEPTION 'Jumlah pembayaran melebihi total denda yang dimiliki.';
  END IF;

  INSERT INTO public.pembayaran_denda (id_nis, jumlah_bayar, status_pembayaran, bukti_pembayaran_url)
  VALUES (p_id_nis, p_jumlah_bayar, 'pending', p_bukti_pembayaran_url);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in request_fine_payment function: %', SQLERRM;
    RETURN FALSE;
END;
$$;