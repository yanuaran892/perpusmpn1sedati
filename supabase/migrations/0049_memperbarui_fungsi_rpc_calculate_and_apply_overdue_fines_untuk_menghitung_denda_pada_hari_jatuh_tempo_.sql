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
      s.status = 'dipinjam' AND s.tanggal_kembali <= CURRENT_DATE -- Perubahan di sini: dari < menjadi <=
  LOOP
    -- Calculate days late (CURRENT_DATE - tanggal_kembali)
    v_days_late := (CURRENT_DATE - r.tanggal_kembali);

    -- Calculate denda (1000 Rp per day late)
    v_calculated_denda := v_days_late * 1000;

    -- Only update if the calculated denda is greater than the current denda in sirkulasi
    -- This prevents recalculating and adding the same denda multiple times if the function is run daily
    IF v_calculated_denda > r.current_sirkulasi_denda THEN
      v_denda_diff := v_calculated_denda - r.current_sirkulasi_denda;

      -- Update sirkulasi denda
      UPDATE public.sirkulasi
      SET denda = v_calculated_denda
      WHERE id_sirkulasi = r.id_sirkulasi;

      -- Update siswa total_denda (add the difference)
      UPDATE public.siswa
      SET total_denda = r.current_siswa_total_denda + v_denda_diff
      WHERE id_nis = r.id_nis;
    END IF;
  END LOOP;
END;
$$;