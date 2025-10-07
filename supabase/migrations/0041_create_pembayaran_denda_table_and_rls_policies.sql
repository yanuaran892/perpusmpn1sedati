-- Create the pembayaran_denda table
CREATE TABLE public.pembayaran_denda (
  id_pembayaran SERIAL PRIMARY KEY,
  id_nis VARCHAR(255) REFERENCES public.siswa(id_nis) ON DELETE CASCADE NOT NULL,
  jumlah_bayar NUMERIC(10, 2) NOT NULL,
  tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_pembayaran TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
  admin_id BIGINT REFERENCES public.admin(id) ON DELETE SET NULL, -- Admin who approved/rejected
  bukti_pembayaran_url TEXT, -- Optional: URL to proof of payment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.pembayaran_denda ENABLE ROW LEVEL SECURITY;

-- Policy for students to insert their own payment requests
CREATE POLICY "Siswa can request their own fine payments" ON public.pembayaran_denda
FOR INSERT TO authenticated WITH CHECK (id_nis = current_setting('app.current_nis'::text, true));

-- Policy for students to view their own payment history
CREATE POLICY "Siswa can view their own fine payments" ON public.pembayaran_denda
FOR SELECT TO authenticated USING (id_nis = current_setting('app.current_nis'::text, true));

-- Policy for admins to view all payment requests
CREATE POLICY "Admins can view all fine payments" ON public.pembayaran_denda
FOR SELECT TO authenticated USING (true);

-- Policy for admins to update payment status (approve/reject)
CREATE POLICY "Admins can update fine payment status" ON public.pembayaran_denda
FOR UPDATE TO authenticated USING (true);