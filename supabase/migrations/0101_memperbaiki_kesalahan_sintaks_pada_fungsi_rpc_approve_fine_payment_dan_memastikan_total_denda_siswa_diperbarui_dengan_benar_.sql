CREATE OR REPLACE FUNCTION public.approve_fine_payment(p_id_pembayaran integer, p_admin_id bigint, p_admin_username text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_payment_record public.pembayaran_denda;
  v_current_total_denda NUMERIC;
BEGIN
  -- Get payment record
  SELECT * INTO v_payment_record
  FROM public.pembayaran_denda
  WHERE id_pembayaran = p_id_pembayaran;

  IF v_payment_record IS NULL THEN
    RAISE EXCEPTION 'Pembayaran denda ID % tidak ditemukan.', p_id_pembayaran;
  END IF;

  IF v_payment_record.status_pembayaran <> 'pending' THEN
    RAISE EXCEPTION 'Pembayaran denda ID % tidak dalam status pending.', p_id_pembayaran;
  END IF;

  -- Update payment status to 'approved'
  UPDATE public.pembayaran_denda
  SET
    status_pembayaran = 'approved',
    admin_id = p_admin_id,
    updated_at = NOW()
  WHERE id_pembayaran = p_id_pembayaran;

  -- Decrement siswa.total_denda
  SELECT total_denda INTO v_current_total_denda
  FROM public.siswa
  WHERE id_nis = v_payment_record.id_nis;

  UPDATE public.siswa
  SET total_denda = GREATEST(0, v_current_total_denda - v_payment_record.jumlah_bayar)
  WHERE id_nis = v_payment_record.id_nis;

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (p_admin_id, p_admin_username, 'APPROVE_FINE_PAYMENT', 'Admin approved fine payment for NIS ' || v_payment_record.id_nis || ' (ID Pembayaran: ' || p_id_pembayaran || ')', 'SUCCESS');

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'APPROVE_FINE_PAYMENT', 'Failed to approve fine payment for ID ' || p_id_pembayaran || ': ' || SQLERRM, 'FAILED');
    RAISE WARNING 'Error in approve_fine_payment function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;