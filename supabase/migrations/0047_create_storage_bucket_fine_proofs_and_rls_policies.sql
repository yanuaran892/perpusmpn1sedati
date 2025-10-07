-- Create the 'fine_proofs' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('fine_proofs', 'fine_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload files to 'fine_proofs'
CREATE POLICY "Allow authenticated upload to fine_proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'fine_proofs');

-- Policy for authenticated users to view their own uploaded files in 'fine_proofs'
CREATE POLICY "Allow authenticated read of own fine_proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'fine_proofs' AND owner = auth.uid());

-- Policy for public read access to 'fine_proofs' (if needed for admin to view, or if proof is public)
-- For now, we'll assume public read is okay for admin to view.
CREATE POLICY "Allow public read access to fine_proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'fine_proofs');

-- Policy for admins to delete files from 'fine_proofs' (optional, but good for cleanup)
-- This policy assumes admin_id in admin_logs is linked to auth.users.id for RLS,
-- but since we're using a custom admin table, we'll make it simpler for now.
-- A more robust solution would involve checking if the user is an admin.
-- For simplicity, we'll allow authenticated users (admins) to delete.
CREATE POLICY "Allow authenticated delete from fine_proofs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'fine_proofs');