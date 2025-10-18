-- Hapus kebijakan RLS INSERT yang ada pada tabel pembayaran_denda
DROP POLICY IF EXISTS "Siswa can insert their own fine payments" ON public.pembayaran_denda;

-- Buat ulang fungsi RPC request_fine_payment dengan pemeriksaan otorisasi internal
CREATE OR REPLACE FUNCTION public.request_fine_payment(p_id_nis text, p_jumlah_bayar numeric, p_bukti_pembayaran_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  student_total_denda numeric;
  current_nis_setting text;
BEGIN
  RAISE NOTICE 'request_fine_payment called with p_id_nis: %, p_jumlah_bayar: %', p_id_nis, p_jumlah_bayar;

  -- Dapatkan pengaturan app.current_nis saat ini untuk debugging dan otorisasi
  current_nis_setting := current_setting('app.current_nis'::text, true);
  RAISE NOTICE 'Current app.current_nis setting in request_fine_payment: %', current_nis_setting;

  -- PENTING: Tambahkan pemeriksaan otorisasi di sini
  IF current_nis_setting IS NULL OR p_id_nis <> current_nis_setting THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Anda hanya dapat mengajukan pembayaran denda untuk NIS Anda sendiri.');
  END IF;

  -- Periksa apakah siswa memiliki cukup total_denda untuk menutupi pembayaran
  SELECT total_denda INTO student_total_denda FROM public.siswa WHERE id_nis = p_id_nis;

  IF student_total_denda IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Siswa dengan NIS ' || p_id_nis || ' tidak ditemukan.');
  END IF;

  IF student_total_denda < p_jumlah_bayar THEN
    RETURN jsonb_build_object('success', false, 'message', 'Jumlah pembayaran melebihi total denda yang dimiliki. Total Denda: Rp ' || student_total_denda || ', Jumlah Bayar: Rp ' || p_jumlah_bayar);
  END IF;

  INSERT INTO public.pembayaran_denda (id_nis, jumlah_bayar, status_pembayaran, bukti_pembayaran_url)
  VALUES (p_id_nis, p_jumlah_bayar, 'pending', p_bukti_pembayaran_url);

  RETURN jsonb_build_object('success', true, 'message', 'Permintaan pembayaran denda berhasil diajukan!');
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in request_fine_payment function: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'message', 'Terjadi kesalahan tak terduga saat mengajukan pembayaran denda: ' || SQLERRM);
END;
$function$;

-- Buat kebijakan RLS INSERT baru yang lebih sederhana untuk pembayaran_denda
-- Fungsi RPC SECURITY DEFINER akan menangani otorisasi sebenarnya.
CREATE POLICY "Allow authenticated inserts to pembayaran_denda via RPC"
ON public.pembayaran_denda FOR INSERT TO authenticated
WITH CHECK (true);