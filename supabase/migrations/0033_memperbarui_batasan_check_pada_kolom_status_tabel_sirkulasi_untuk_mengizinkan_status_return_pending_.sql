ALTER TABLE public.sirkulasi
DROP CONSTRAINT IF EXISTS sirkulasi_status_check;

ALTER TABLE public.sirkulasi
ADD CONSTRAINT sirkulasi_status_check
CHECK (status IN ('pending', 'dipinjam', 'dikembalikan', 'rejected', 'return_pending'));