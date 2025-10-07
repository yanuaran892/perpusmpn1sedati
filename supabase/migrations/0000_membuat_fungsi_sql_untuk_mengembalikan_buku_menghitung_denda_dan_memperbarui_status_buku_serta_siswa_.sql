CREATE OR REPLACE FUNCTION public.return_book(
  p_sirkulasi_id integer,
  p_id_buku integer,
  p_id_nis text
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
  v_tanggal_kembali DATE;
  v_days_late INTEGER := 0;
  v_calculated_denda NUMERIC := 0;
  v_current_sedang_pinjam INTEGER;
  v_current_total_denda NUMERIC;
BEGIN
  -- 1. Get expected return date
  SELECT tanggal_kembali INTO v_tanggal_kembali
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_tanggal_kembali IS NULL THEN
    RAISE EXCEPTION 'Sirkulasi ID % tidak ditemukan atau tanggal kembali tidak valid.', p_sirkulasi_id;
  END IF;

  -- 2. Calculate days late and fine
  v_days_late := (CURRENT_DATE - v_tanggal_kembali);
  IF v_days_late > 0 THEN
    v_calculated_denda := v_days_late * 1000; -- Rp 1000 per day late
  END IF;

  -- 3. Update sirkulasi table
  UPDATE public.sirkulasi
  SET
    status = 'dikembalikan',
    tanggal_dikembalikan = CURRENT_DATE,
    denda = v_calculated_denda
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- 4. Update buku table: increment jumlah_buku
  UPDATE public.buku
  SET jumlah_buku = (jumlah_buku::integer + 1)::text
  WHERE id_buku = p_id_buku;

  -- 5. Update siswa table: decrement sedang_pinjam, increment total_denda
  SELECT sedang_pinjam, total_denda INTO v_current_sedang_pinjam, v_current_total_denda
  FROM public.siswa
  WHERE id_nis = p_id_nis;

  UPDATE public.siswa
  SET
    sedang_pinjam = v_current_sedang_pinjam - 1,
    total_denda = v_current_total_denda + v_calculated_denda
  WHERE id_nis = p_id_nis;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in return_book function: %', SQLERRM;
    RETURN FALSE;
END;
$$;