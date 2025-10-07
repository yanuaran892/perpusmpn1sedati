-- Drop the existing check constraint if it exists
ALTER TABLE public.sirkulasi
DROP CONSTRAINT IF EXISTS sirkulasi_status_check;

-- Add a new check constraint to allow 'pending', 'dipinjam', 'dikembalikan', and 'rejected' statuses
ALTER TABLE public.sirkulasi
ADD CONSTRAINT sirkulasi_status_check
CHECK (status IN ('pending', 'dipinjam', 'dikembalikan', 'rejected'));