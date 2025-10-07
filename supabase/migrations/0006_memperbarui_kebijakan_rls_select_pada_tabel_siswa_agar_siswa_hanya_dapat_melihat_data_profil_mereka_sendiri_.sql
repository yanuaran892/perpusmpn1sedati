-- Hapus kebijakan SELECT yang ada jika ada
DROP POLICY IF EXISTS "Siswa can view their own data" ON public.siswa;

-- Buat kebijakan SELECT baru untuk tabel siswa agar siswa yang terautentikasi dapat melihat data mereka sendiri
CREATE POLICY "Siswa can view their own data" ON public.siswa
FOR SELECT TO authenticated USING ((id_nis)::text = current_setting('app.current_nis'::text, true));