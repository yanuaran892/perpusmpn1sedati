-- Hapus kebijakan SELECT yang ada jika ada yang terlalu permisif atau tidak benar
DROP POLICY IF EXISTS "Temporary public select for authenticated" ON public.siswa;

-- Buat kebijakan SELECT baru untuk tabel siswa agar siswa yang terautentikasi dapat melihat data mereka sendiri
CREATE POLICY "Siswa can view their own data" ON public.siswa
FOR SELECT TO authenticated USING ((id_nis)::text = current_setting('app.current_nis'::text, true));