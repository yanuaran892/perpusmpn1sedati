DROP POLICY IF EXISTS "Siswa can request their own fine payments" ON public.pembayaran_denda;
CREATE POLICY "Siswa can request their own fine payments" ON public.pembayaran_denda
FOR INSERT TO authenticated WITH CHECK ((id_nis)::text = current_setting('app.current_nis'::text, true));