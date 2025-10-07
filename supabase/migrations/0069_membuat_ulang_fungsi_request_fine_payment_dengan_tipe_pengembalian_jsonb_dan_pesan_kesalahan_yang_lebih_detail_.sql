CREATE OR REPLACE FUNCTION public.request_fine_payment(p_id_nis text, p_jumlah_bayar numeric, p_bukti_pembayaran_url text DEFAULT NULL::text)
 RETURNS jsonb
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
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: NIS tidak cocok dengan siswa yang terautentikasi. NIS Sesi: ' || COALESCE(session_nis, 'NULL') || ', NIS Diberikan: ' || p_id_nis);
  END IF;

  -- Check if the student has enough total_denda to cover the payment
  SELECT total_denda INTO student_total_denda FROM public.siswa WHERE id_nis = p_id_nis;

  IF student_total_denda IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Siswa dengan NIS ' || p_id_nis || ' tidak ditemukan.');
  END IF;

  IF student_total_denda < p_jumlah_bayar THEN
    RETURN jsonb_build_object('success', false, 'message', 'Jumlah pembayaran melebihi total denda yang dimiliki. Total Denda: Rp ' || student_total_denda || ', Jumlah Bayar: Rp ' || p_jumlah_bayar);
  END IF;

  INSERT INTO public.pembayaran_denda (id_nis, jumlah_bayar, status_pembayaran, bukti_pembayaran_url)
  VALUES (p_id_nis, p_jumlah_bayar, 'pending', p_bukti_pembayaran_url);

  RETURN jsonb_build_object('success', true, 'message', 'Permintaan pembayaran denda berhasil diajukan!');
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in request_fine_payment function: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'message', 'Terjadi kesalahan tak terduga saat mengajukan pembayaran denda: ' || SQLERRM);
END;
$function$;