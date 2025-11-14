-- Update the calculate_and_apply_overdue_fines function to use business days
CREATE OR REPLACE FUNCTION calculate_and_apply_overdue_fines()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_overdue_record RECORD;
  v_days_overdue INTEGER;
  v_fine_amount NUMERIC;
  v_fine_per_day NUMERIC := 500;
BEGIN
  FOR v_overdue_record IN
    SELECT 
      id_sirkulasi,
      id_nis,
      id_buku,
      tanggal_kembali,
      denda
    FROM sirkulasi
    WHERE status = 'dipinjam'
      AND tanggal_kembali < NOW()
  LOOP
    -- Calculate business days overdue (excluding weekends and holidays)
    v_days_overdue := calculate_business_days(
      v_overdue_record.tanggal_kembali,
      NOW()
    );

    IF v_days_overdue > 0 THEN
      v_fine_amount := v_days_overdue * v_fine_per_day;

      -- Update circulation record with new fine
      UPDATE sirkulasi
      SET denda = v_fine_amount
      WHERE id_sirkulasi = v_overdue_record.id_sirkulasi;

      -- Update student's total fine
      UPDATE siswa
      SET total_denda = (
        SELECT COALESCE(SUM(denda), 0)
        FROM sirkulasi
        WHERE id_nis = v_overdue_record.id_nis
      )
      WHERE id_nis = v_overdue_record.id_nis;
    END IF;
  END LOOP;
END;
$$;

-- Update approve_return_request_admin to use business days
CREATE OR REPLACE FUNCTION approve_return_request_admin(p_sirkulasi_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id_nis TEXT;
  v_id_buku INTEGER;
  v_tanggal_kembali TIMESTAMP WITH TIME ZONE;
  v_days_overdue INTEGER;
  v_fine_amount NUMERIC := 0;
  v_fine_per_day NUMERIC := 500;
BEGIN
  SELECT id_nis, id_buku, tanggal_kembali
  INTO v_id_nis, v_id_buku, v_tanggal_kembali
  FROM sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id AND status = 'return_pending';

  IF v_id_nis IS NULL THEN
    RAISE EXCEPTION 'Permintaan pengembalian tidak ditemukan atau status tidak valid.';
  END IF;

  -- Calculate business days overdue
  IF NOW() > v_tanggal_kembali THEN
    v_days_overdue := calculate_business_days(v_tanggal_kembali, NOW());
    IF v_days_overdue > 0 THEN
      v_fine_amount := v_days_overdue * v_fine_per_day;
    END IF;
  END IF;

  -- Update circulation record
  UPDATE sirkulasi
  SET 
    status = 'dikembalikan',
    tanggal_dikembalikan = NOW(),
    denda = v_fine_amount
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- Update book quantity
  UPDATE buku
  SET jumlah_buku = (jumlah_buku::INTEGER + 1)::TEXT
  WHERE id_buku = v_id_buku;

  -- Update student's borrowing count
  UPDATE siswa
  SET sedang_pinjam = GREATEST(0, sedang_pinjam - 1)
  WHERE id_nis = v_id_nis;

  -- Update student's total fine
  UPDATE siswa
  SET total_denda = (
    SELECT COALESCE(SUM(denda), 0)
    FROM sirkulasi
    WHERE id_nis = v_id_nis
  )
  WHERE id_nis = v_id_nis;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION calculate_and_apply_overdue_fines IS 'Calculate and apply overdue fines using business days (excluding weekends and holidays)';