CREATE OR REPLACE FUNCTION public.request_fine_payment(p_id_nis text, p_jumlah_bayar numeric, p_bukti_pembayaran_url text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  session_nis text;
  student_total_denda numeric;
BEGIN
  session_nis := current_setting('app.current_nis'::text, true);
  RAISE NOTICE 'request_fine_payment: p_id_nis = %, session_nis = %', p_id_nis, session_nis;

  -- Ensure the student is authenticated and matches the provided NIS
  IF session_nis IS NULL OR session_nis <> p_id_nis THEN
    RAISE EXCEPTION 'Unauthorized: NIS does not match authenticated student. Session NIS: %, Provided NIS: %', session_nis, p_id_nis;
  END IF;

  -- Check if the student has enough total_denda to cover the payment
  SELECT total_denda INTO student_total_denda FROM public.siswa WHERE id_nis = p_id_nis;

  IF student_total_denda IS NULL THEN
    RAISE EXCEPTION 'Siswa dengan NIS % tidak ditemukan.', p_id_nis;
  END IF;

  IF student_total_denda < p_jumlah_bayar THEN
    RAISE EXCEPTION 'Jumlah pembayaran melebihi total denda yang dimiliki. Total Denda: Rp %, Jumlah Bayar: Rp %', student_total_denda, p_jumlah_bayar;
  END IF;

  INSERT INTO public.pembayaran_denda (id_nis, jumlah_bayar, status_pembayaran, bukti_pembayaran_url)
  VALUES (p_id_nis, p_jumlah_bayar, 'pending', p_bukti_pembayaran_url);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in request_fine_payment function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;