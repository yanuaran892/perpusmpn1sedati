CREATE OR REPLACE FUNCTION public.reject_fine_payment(
  p_id_pembayaran INTEGER,
  p_admin_id BIGINT,
  p_admin_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
  v_payment_record public.pembayaran_denda;
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

  -- Update payment status to 'rejected'
  UPDATE public.pembayaran_denda
  SET
    status_pembayaran = 'rejected',
    admin_id = p_admin_id,
    updated_at = NOW()
  WHERE id_pembayaran = p_id_pembayaran;

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (p_admin_id, p_admin_username, 'REJECT_FINE_PAYMENT', 'Admin rejected fine payment for NIS ' || v_payment_record.id_nis || ' (ID Pembayaran: ' || p_id_pembayaran || ')', 'SUCCESS');

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'REJECT_FINE_PAYMENT', 'Failed to reject fine payment for ID ' || p_id_pembayaran || ': ' || SQLERRM, 'FAILED');
    RAISE WARNING 'Error in reject_fine_payment function: %', SQLERRM;
    RETURN FALSE;
END;
$$;