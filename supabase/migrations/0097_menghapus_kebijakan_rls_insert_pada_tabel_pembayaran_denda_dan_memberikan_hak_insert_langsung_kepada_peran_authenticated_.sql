-- Hapus kebijakan RLS INSERT yang ada pada tabel pembayaran_denda
DROP POLICY IF EXISTS "Allow authenticated users to insert fine payments" ON public.pembayaran_denda;

-- Berikan hak INSERT langsung pada tabel pembayaran_denda kepada peran authenticated.
-- Ini akan memungkinkan fungsi SECURITY DEFINER untuk melakukan INSERT tanpa terhalang oleh RLS.
GRANT INSERT ON public.pembayaran_denda TO authenticated;