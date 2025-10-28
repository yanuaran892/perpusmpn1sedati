CREATE OR REPLACE FUNCTION public.reject_extension_request_admin(p_sirkulasi_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
BEGIN
  -- Get sirkulasi record
  SELECT * INTO v_sirkulasi_record
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_sirkulasi_record IS NULL THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak ditemukan.', p_sirkulasi_id;
  END IF;

  IF v_sirkulasi_record.status <> 'extension_pending' THEN
    RAISE EXCEPTION 'Permintaan perpanjangan ID % tidak dalam status menunggu persetujuan.', p_sirkulasi_id;
  END IF;

  -- Update sirkulasi status to 'dipinjam' (revert to original state)
  -- Also reset tanggal_kembali_request as the extension was rejected
  -- And set the new extension_rejected flag to true
  UPDATE public.sirkulasi
  SET
    status = 'dipinjam',
    tanggal_kembali_request = NULL, -- Reset the request date
    extension_rejected = TRUE -- Set the rejection flag
  WHERE id_sirkulasi = p_sirkulasi_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in reject_extension_request_admin function: %', SQLERRM;
    RETURN FALSE;
END;
$function$