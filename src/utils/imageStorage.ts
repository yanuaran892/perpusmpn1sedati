import { supabase } from '@/integrations/supabase/client';

// Fungsi untuk mendapatkan URL langsung dari Google Drive (tetap dipertahankan)
export const getGoogleDriveDirectLink = (driveUrl: string): string => {
  if (!driveUrl || driveUrl.trim() === '') {
    return '/placeholder.svg';
  }

  if (!driveUrl.startsWith('http://') && !driveUrl.startsWith('https://')) {
    console.warn(`Input bukan format URL yang valid: ${driveUrl}. Mengembalikan placeholder.`);
    return '/placeholder.svg';
  }

  // Regex untuk mencocokkan ID file Google Drive dari tautan berbagi umum
  // Contoh: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Atau: https://drive.google.com/file/d/FILE_ID/edit
  // Atau: https://drive.google.com/file/d/FILE_ID/preview
  // Atau: https://drive.google.com/file/d/FILE_ID/pr (seperti yang Anda miliki)
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/view|\/edit|\/preview|\/pr)?/);

  if (match && match[1]) {
    const fileId = match[1];
    // Ini adalah format tautan unduhan langsung untuk file Google Drive
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  console.warn(`Tidak dapat mengekstrak ID file Google Drive dari URL: ${driveUrl}. Mengembalikan URL asli.`);
  return driveUrl; // Ini hanya akan terjadi jika itu adalah URL http/https tetapi bukan tautan berbagi Google Drive yang dikenali
};

// Fungsi untuk mendapatkan URL publik dari Supabase Storage
export const getSupabasePublicUrl = (filePath: string): string => {
  if (!filePath || filePath.trim() === '') {
    return '/placeholder.svg';
  }
  const { data } = supabase.storage.from('book_images').getPublicUrl(filePath);
  return data?.publicUrl || '/placeholder.svg';
};

// Fungsi utama untuk mendapatkan URL gambar, mendukung Google Drive, Supabase Storage, dan URL langsung lainnya
export const getImageUrl = (imageSource: string): string => {
  if (!imageSource || imageSource.trim() === '') {
    return '/placeholder.svg';
  }

  // Jika string terlihat seperti URL Google Drive
  if (imageSource.includes('drive.google.com')) {
    return getGoogleDriveDirectLink(imageSource);
  }
  // Jika string terlihat seperti path Supabase Storage (tidak dimulai dengan http)
  else if (!imageSource.startsWith('http')) {
    return getSupabasePublicUrl(imageSource);
  }
  // Jika itu adalah URL lain (misalnya, URL gambar langsung dari web)
  return imageSource;
};