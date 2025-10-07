CREATE OR REPLACE FUNCTION public.get_student_fine_payments(p_id_nis text)
 RETURNS TABLE(id_pembayaran integer, jumlah_bayar numeric, tanggal_bayar timestamp with time zone, status_pembayaran text, bukti_pembayaran_url text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  current_nis_setting text;
BEGIN
  RAISE NOTICE 'get_student_fine_payments called with p_id_nis: %', p_id_nis;

  -- Rely on app.current_nis being set by login_siswa for the session
  current_nis_setting := current_setting('app.current_nis'::text, true);
  RAISE NOTICE 'Inside get_student_fine_payments: app.current_nis from session: %', current_nis_setting;

  -- Ensure the student is authenticated and matches the provided NIS
  IF current_nis_setting IS NULL OR current_nis_setting <> p_id_nis THEN
    RAISE EXCEPTION 'Unauthorized: NIS does not match authenticated student. Current session setting: %, Provided NIS: %', current_nis_setting, p_id_nis;
  END IF;

  RETURN QUERY
  SELECT
    pd.id_pembayaran,
    pd.jumlah_bayar,
    pd.tanggal_bayar,
    pd.status_pembayaran,
    pd.bukti_pembayaran_url,
    pd.created_at
  FROM
    public.pembayaran_denda pd
  WHERE
    pd.id_nis = p_id_nis
  ORDER BY pd.created_at DESC;
END;
$function$;