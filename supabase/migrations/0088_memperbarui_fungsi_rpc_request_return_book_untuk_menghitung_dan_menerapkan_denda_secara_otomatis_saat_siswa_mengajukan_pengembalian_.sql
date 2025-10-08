CREATE OR REPLACE FUNCTION public.request_return_book(p_sirkulasi_id integer, p_id_nis text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
  v_days_late INTEGER := 0;
  v_calculated_denda NUMERIC := 0;
  v_current_total_denda NUMERIC;
  v_time_difference INTERVAL;
  v_actual_return_time TIMESTAMP WITH TIME ZONE := NOW(); -- Capture current time for return request
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

  -- Calculate days late and fine based on actual return request time (v_actual_return_time)
  IF v_actual_return_time > v_sirkulasi_record.tanggal_kembali THEN
    v_time_difference := v_actual_return_time - v_sirkulasi_record.tanggal_kembali;
    -- Calculate days late, rounding up to the nearest whole day if any part of a day is exceeded
    v_days_late := CEIL(EXTRACT(EPOCH FROM v_time_difference) / (24 * 3600))::INTEGER;
    v_calculated_denda := v_days_late * 1000; -- Rp 1000 per day late
  END IF;

  RAISE NOTICE 'Sirkulasi ID: %, Tanggal Kembali (Estimasi): %, Tanggal Dikembalikan (Aktual): %',
               p_sirkulasi_id, v_sirkulasi_record.tanggal_kembali, v_actual_return_time;
  RAISE NOTICE 'Hari Terlambat: %, Denda Terhitung: Rp %', v_days_late, v_calculated_denda;

  -- Update sirkulasi status to 'return_pending', set tanggal_dikembalikan, and set denda
  UPDATE public.sirkulasi
  SET
    status = 'return_pending',
    tanggal_dikembalikan = v_actual_return_time,
    denda = v_calculated_denda
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- Increment siswa.total_denda if a fine was calculated
  IF v_calculated_denda > 0 THEN
    SELECT total_denda INTO v_current_total_denda
    FROM public.siswa
    WHERE id_nis = v_sirkulasi_record.id_nis;

    UPDATE public.siswa
    SET total_denda = v_current_total_denda + v_calculated_denda
    WHERE id_nis = v_sirkulasi_record.id_nis;
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in request_return_book function: %', SQLERRM;
    RETURN FALSE;
END;
$function$