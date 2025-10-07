-- Rename and modify the existing return_book function to request_return_book
CREATE OR REPLACE FUNCTION public.request_return_book(p_sirkulasi_id integer, p_id_nis text)
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

  IF v_sirkulasi_record.status <> 'dipinjam' THEN
    RAISE EXCEPTION 'Buku tidak dalam status dipinjam.';
  END IF;

  IF v_sirkulasi_record.id_nis <> p_id_nis THEN
    RAISE EXCEPTION 'Anda tidak memiliki izin untuk mengembalikan buku ini.';
  END IF;

  -- Update sirkulasi status to 'return_pending' and set tanggal_dikembalikan to NOW()
  UPDATE public.sirkulasi
  SET
    status = 'return_pending',
    tanggal_dikembalikan = NOW() -- Record when the student requested the return
  WHERE id_sirkulasi = p_sirkulasi_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in request_return_book function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

-- Create new RPC function for admin to approve return requests
CREATE OR REPLACE FUNCTION public.approve_return_request_admin(p_sirkulasi_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
  v_days_late INTEGER := 0;
  v_calculated_denda NUMERIC := 0;
  v_current_sedang_pinjam INTEGER;
  v_current_total_denda NUMERIC;
BEGIN
  -- Get sirkulasi record
  SELECT * INTO v_sirkulasi_record
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_sirkulasi_record IS NULL THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak ditemukan.', p_sirkulasi_id;
  END IF;

  IF v_sirkulasi_record.status <> 'return_pending' THEN
    RAISE EXCEPTION 'Permintaan pengembalian ID % tidak dalam status menunggu persetujuan.', p_sirkulasi_id;
  END IF;

  -- Calculate days late and fine based on tanggal_dikembalikan (when student requested)
  -- If tanggal_dikembalikan is null (shouldn't happen if request_return_book sets it), use CURRENT_DATE
  v_days_late := (v_sirkulasi_record.tanggal_dikembalikan::date - v_sirkulasi_record.tanggal_kembali);
  IF v_days_late > 0 THEN
    v_calculated_denda := v_days_late * 1000; -- Rp 1000 per day late
  END IF;

  -- Update sirkulasi status to 'dikembalikan' and set denda
  UPDATE public.sirkulasi
  SET
    status = 'dikembalikan',
    denda = v_calculated_denda
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- Increment buku.jumlah_buku
  UPDATE public.buku
  SET jumlah_buku = (jumlah_buku::integer + 1)::text
  WHERE id_buku = v_sirkulasi_record.id_buku;

  -- Decrement siswa.sedang_pinjam and increment siswa.total_denda
  SELECT sedang_pinjam, total_denda INTO v_current_sedang_pinjam, v_current_total_denda
  FROM public.siswa
  WHERE id_nis = v_sirkulasi_record.id_nis;

  UPDATE public.siswa
  SET
    sedang_pinjam = GREATEST(0, v_current_sedang_pinjam - 1),
    total_denda = v_current_total_denda + v_calculated_denda
  WHERE id_nis = v_sirkulasi_record.id_nis;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in approve_return_request_admin function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

-- Create new RPC function for admin to reject return requests
CREATE OR REPLACE FUNCTION public.reject_return_request_admin(p_sirkulasi_id integer)
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

  IF v_sirkulasi_record.status <> 'return_pending' THEN
    RAISE EXCEPTION 'Permintaan pengembalian ID % tidak dalam status menunggu persetujuan.', p_sirkulasi_id;
  END IF;

  -- Update sirkulasi status to 'dipinjam' (revert to original state)
  -- Also reset tanggal_dikembalikan as the return was rejected
  UPDATE public.sirkulasi
  SET
    status = 'dipinjam',
    tanggal_dikembalikan = NULL,
    denda = 0 -- Reset denda if any was calculated during request (though it shouldn't be)
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- No changes to buku.jumlah_buku or siswa.sedang_pinjam as they were not decremented by request_return_book

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in reject_return_request_admin function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;