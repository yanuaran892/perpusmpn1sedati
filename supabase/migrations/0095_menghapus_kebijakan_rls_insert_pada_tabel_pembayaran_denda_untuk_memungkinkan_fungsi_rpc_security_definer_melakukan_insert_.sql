-- Hapus kebijakan RLS INSERT yang ada pada tabel pembayaran_denda
-- Fungsi RPC 'request_fine_payment' yang SECURITY DEFINER akan menangani INSERT.
DROP POLICY IF EXISTS "Allow authenticated inserts to pembayaran_denda via RPC" ON public.pembayaran_denda;