-- Add RLS policy to allow authenticated users to upload files to the 'book_images' bucket.
CREATE POLICY "Allow authenticated uploads to book_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'book_images');