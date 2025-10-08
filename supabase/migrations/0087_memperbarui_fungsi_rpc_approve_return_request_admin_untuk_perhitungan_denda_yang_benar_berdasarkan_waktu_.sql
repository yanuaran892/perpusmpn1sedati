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
  v_time_difference INTERVAL;
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
  -- Compare full timestamps
  IF v_sirkulasi_record.tanggal_dikembalikan > v_sirkulasi_record.tanggal_kembali THEN
    v_time_difference := v_sirkulasi_record.tanggal_dikembalikan - v_sirkulasi_record.tanggal_kembali;
    -- Calculate days late, rounding up to the nearest whole day if any part of a day is exceeded
    v_days_late := CEIL(EXTRACT(EPOCH FROM v_time_difference) / (24 * 3600))::INTEGER;
    v_calculated_denda := v_days_late * 1000; -- Rp 1000 per day late
  END IF;

  RAISE NOTICE 'Sirkulasi ID: %, Tanggal Kembali (Estimasi): %, Tanggal Dikembalikan (Aktual): %',
               p_sirkulasi_id, v_sirkulasi_record.tanggal_kembali, v_sirkulasi_record.tanggal_dikembalikan;
  RAISE NOTICE 'Hari Terlambat: %, Denda Terhitung: Rp %', v_days_late, v_calculated_denda;

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
$function$