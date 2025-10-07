CREATE OR REPLACE FUNCTION public.admin_add_manual_fine(
  p_id_nis TEXT,
  p_jumlah_denda NUMERIC,
  p_description TEXT,
  p_admin_id BIGINT,
  p_admin_username TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
  v_siswa_exists BOOLEAN;
BEGIN
  -- Check if the student exists
  SELECT EXISTS (SELECT 1 FROM public.siswa WHERE id_nis = p_id_nis) INTO v_siswa_exists;

  IF NOT v_siswa_exists THEN
    RAISE EXCEPTION 'Siswa dengan NIS % tidak ditemukan.', p_id_nis;
  END IF;

  -- Insert into pembayaran_denda with 'approved' status
  INSERT INTO public.pembayaran_denda (
    id_nis,
    jumlah_bayar,
    tanggal_bayar,
    status_pembayaran,
    admin_id,
    updated_at,
    bukti_pembayaran_url -- This will be NULL for manual fines
  ) VALUES (
    p_id_nis,
    p_jumlah_denda,
    NOW(),
    'approved',
    p_admin_id,
    NOW(),
    NULL
  );

  -- Update siswa's total_denda
  UPDATE public.siswa
  SET total_denda = total_denda + p_jumlah_denda
  WHERE id_nis = p_id_nis;

  -- Log the admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (p_admin_id, p_admin_username, 'ADD_MANUAL_FINE', 'Admin menambahkan denda manual sebesar Rp ' || p_jumlah_denda || ' kepada NIS ' || p_id_nis || ': ' || p_description, 'SUCCESS');

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'ADD_MANUAL_FINE', 'Gagal menambahkan denda manual kepada NIS ' || p_id_nis || ': ' || SQLERRM, 'FAILED');
    RAISE WARNING 'Error in admin_add_manual_fine function: %', SQLERRM;
    RETURN FALSE;
END;
$$;