-- Membuat bucket 'book_images' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('book_images', 'book_images', true)
ON CONFLICT (id) DO NOTHING;

-- Mengatur kebijakan RLS untuk akses publik ke bucket 'book_images'
CREATE POLICY "Public access for book images"
ON storage.objects FOR SELECT
USING (bucket_id = 'book_images');