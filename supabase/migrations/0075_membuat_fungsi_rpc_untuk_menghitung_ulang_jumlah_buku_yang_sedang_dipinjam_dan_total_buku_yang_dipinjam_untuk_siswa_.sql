CREATE OR REPLACE FUNCTION public.recalculate_student_borrow_counts(p_id_nis text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  r_siswa RECORD;
  v_actual_sedang_pinjam INTEGER;
  v_actual_total_pinjam INTEGER;
BEGIN
  RAISE NOTICE 'Starting recalculation of student borrow counts for NIS: %', COALESCE(p_id_nis, 'ALL');

  FOR r_siswa IN
    SELECT id_nis
    FROM public.siswa
    WHERE (p_id_nis IS NULL OR id_nis = p_id_nis)
  LOOP
    -- Calculate actual sedang_pinjam (books currently 'dipinjam' or 'return_pending')
    SELECT COUNT(*)::integer
    INTO v_actual_sedang_pinjam
    FROM public.sirkulasi
    WHERE id_nis = r_siswa.id_nis
      AND (status = 'dipinjam' OR status = 'return_pending');

    -- Calculate actual total_pinjam (all non-rejected, non-pending borrow requests that were approved or are pending return)
    SELECT COUNT(*)::integer
    INTO v_actual_total_pinjam
    FROM public.sirkulasi
    WHERE id_nis = r_siswa.id_nis
      AND (status = 'dipinjam' OR status = 'dikembalikan' OR status = 'return_pending');

    -- Update siswa table
    UPDATE public.siswa
    SET
      sedang_pinjam = v_actual_sedang_pinjam,
      total_pinjam = v_actual_total_pinjam
    WHERE id_nis = r_siswa.id_nis;

    RAISE NOTICE '  Updated NIS %: sedang_pinjam = %, total_pinjam = %', r_siswa.id_nis, v_actual_sedang_pinjam, v_actual_total_pinjam;
  END LOOP;

  RAISE NOTICE 'Finished recalculation of student borrow counts.';
END;
$function$;