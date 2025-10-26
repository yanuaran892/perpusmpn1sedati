ALTER TABLE public.sirkulasi
ADD COLUMN tanggal_kembali_request TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.sirkulasi
DROP CONSTRAINT sirkulasi_status_check;

ALTER TABLE public.sirkulasi
ADD CONSTRAINT sirkulasi_status_check CHECK (status::text = ANY (ARRAY['dipinjam'::text, 'dikembalikan'::text, 'pending'::text, 'rejected'::text, 'return_pending'::text, 'extension_pending'::text]));