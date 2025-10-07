-- Hapus kebijakan RLS yang ada untuk SELECT pada public.siswa
DROP POLICY IF EXISTS "Siswa can view their own data" ON public.siswa;

-- Buat kebijakan RLS baru yang mengizinkan akses baca publik (HANYA UNTUK DEBUGGING)
CREATE POLICY "DEBUG: Public read access for siswa" ON public.siswa FOR SELECT USING (true);