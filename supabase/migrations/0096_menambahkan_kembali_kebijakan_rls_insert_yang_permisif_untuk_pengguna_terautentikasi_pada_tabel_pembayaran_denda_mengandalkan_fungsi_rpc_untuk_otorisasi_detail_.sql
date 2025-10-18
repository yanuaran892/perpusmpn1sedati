-- Pastikan RLS diaktifkan pada tabel (jika belum)
ALTER TABLE public.pembayaran_denda ENABLE ROW LEVEL SECURITY;

-- Tambahkan kebijakan INSERT yang permisif untuk pengguna terautentikasi.
-- Fungsi RPC 'request_fine_payment' yang SECURITY DEFINER akan menangani otorisasi sebenarnya.
CREATE POLICY "Allow authenticated users to insert fine payments"
ON public.pembayaran_denda FOR INSERT TO authenticated
WITH CHECK (true);