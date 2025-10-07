-- Hapus kebijakan INSERT yang ada jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Siswa can insert their own circulation data" ON public.sirkulasi;

-- Buat ulang kebijakan INSERT dengan WITH CHECK yang benar
CREATE POLICY "Siswa can insert their own circulation data" ON public.sirkulasi
FOR INSERT TO authenticated
WITH CHECK ((id_nis)::text = current_setting('app.current_nis'::text, true));