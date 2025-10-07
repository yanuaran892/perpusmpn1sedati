CREATE OR REPLACE FUNCTION public.admin_add_manual_fine(p_id_nis text, p_jumlah_denda numeric, p_description text, p_admin_id bigint, p_admin_username text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_siswa_exists BOOLEAN;
  v_new_payment_id INTEGER;
  v_current_total_denda NUMERIC;
BEGIN
  -- Check if the student exists
  SELECT EXISTS (SELECT 1 FROM public.siswa WHERE id_nis = p_id_nis) INTO v_siswa_exists;

  IF NOT v_siswa_exists THEN
    RAISE EXCEPTION 'Siswa dengan NIS % tidak ditemukan.', p_id_nis;
  END IF;

  -- Insert into pembayaran_denda with 'pending' status
  INSERT INTO public.pembayaran_denda (
    id_nis,
    jumlah_bayar,
    tanggal_bayar,
    status_pembayaran,
    bukti_pembayaran_url -- This will be NULL for manual fines
  ) VALUES (
    p_id_nis,
    p_jumlah_denda,
    NOW(), -- Tanggal permintaan denda manual
    'pending', -- Status diatur ke 'pending'
    NULL
  ) RETURNING id_pembayaran INTO v_new_payment_id; -- Get the ID of the new payment

  -- Increment siswa.total_denda immediately when a manual fine is added
  SELECT total_denda INTO v_current_total_denda
  FROM public.siswa
  WHERE id_nis = p_id_nis;

  UPDATE public.siswa
  SET total_denda = v_current_total_denda + p_jumlah_denda
  WHERE id_nis = p_id_nis;

  -- Log the admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (p_admin_id, p_admin_username, 'ADD_MANUAL_FINE_REQUEST', 'Admin mengajukan denda manual sebesar Rp ' || p_jumlah_denda || ' kepada NIS ' || p_id_nis || ' (ID Pembayaran: ' || v_new_payment_id || '): ' || p_description, 'SUCCESS');

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'ADD_MANUAL_FINE_REQUEST', 'Gagal mengajukan denda manual kepada NIS ' || p_id_nis || ': ' || SQLERRM, 'FAILED');
    RAISE WARNING 'Error in admin_add_manual_fine function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;