CREATE OR REPLACE FUNCTION public.calculate_and_apply_overdue_fines()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
  r RECORD;
  v_days_late INTEGER;
  v_calculated_denda NUMERIC;
  v_current_total_denda NUMERIC;
  v_denda_diff NUMERIC;
BEGIN
  RAISE NOTICE 'Fungsi calculate_and_apply_overdue_fines dimulai.';

  FOR r IN
    SELECT
      s.id_sirkulasi,
      s.id_nis,
      s.tanggal_kembali,
      s.denda AS current_sirkulasi_denda,
      si.total_denda AS current_siswa_total_denda
    FROM
      public.sirkulasi s
    JOIN
      public.siswa si ON s.id_nis = si.id_nis
    WHERE
      s.status = 'dipinjam' AND s.tanggal_kembali <= CURRENT_DATE
  LOOP
    RAISE NOTICE 'Memproses sirkulasi ID: %, NIS: %, Tanggal Kembali: %, Status: %', r.id_sirkulasi, r.id_nis, r.tanggal_kembali, r.status;

    v_days_late := (CURRENT_DATE - r.tanggal_kembali);
    v_calculated_denda := v_days_late * 1000;

    RAISE NOTICE '  Hari Terlambat: %, Denda Terhitung: Rp %', v_days_late, v_calculated_denda;
    RAISE NOTICE '  Denda Sirkulasi Saat Ini: Rp %, Total Denda Siswa Saat Ini: Rp %', r.current_sirkulasi_denda, r.current_siswa_total_denda;

    IF v_calculated_denda > r.current_sirkulasi_denda THEN
      v_denda_diff := v_calculated_denda - r.current_sirkulasi_denda;

      UPDATE public.sirkulasi
      SET denda = v_calculated_denda
      WHERE id_sirkulasi = r.id_sirkulasi;

      UPDATE public.siswa
      SET total_denda = r.current_siswa_total_denda + v_denda_diff
      WHERE id_nis = r.id_nis;

      RAISE NOTICE '  Denda diperbarui untuk sirkulasi ID %: Denda baru Rp %, Total denda siswa baru Rp %', r.id_sirkulasi, v_calculated_denda, (r.current_siswa_total_denda + v_denda_diff);
    ELSE
      RAISE NOTICE '  Denda tidak diperbarui untuk sirkulasi ID % karena denda terhitung tidak lebih besar dari denda saat ini.', r.id_sirkulasi;
    END IF;
  END LOOP;
  RAISE NOTICE 'Fungsi calculate_and_apply_overdue_fines selesai.';
END;
$$;