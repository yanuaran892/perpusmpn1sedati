ALTER TABLE public.sirkulasi
ADD COLUMN IF NOT EXISTS jumlah_perpanjangan INTEGER DEFAULT 0;