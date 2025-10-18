-- Pastikan RLS diaktifkan pada tabel
ALTER TABLE public.pembayaran_denda ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan INSERT yang aman untuk siswa yang terautentikasi
-- Kebijakan ini memungkinkan pengguna terautentikasi untuk memasukkan baris ke pembayaran_denda
-- HANYA jika id_nis dari baris baru cocok dengan app.current_nis sesi mereka.
CREATE POLICY "Siswa can insert their own fine payments"
ON public.pembayaran_denda FOR INSERT TO authenticated
WITH CHECK ((id_nis)::text = current_setting('app.current_nis'::text, true));