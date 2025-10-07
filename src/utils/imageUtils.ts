export const getGoogleDriveDirectLink = (driveUrl: string): string => {
  if (!driveUrl || driveUrl.trim() === '') {
    return '/placeholder.svg';
  }

  // Periksa apakah input terlihat seperti URL sama sekali
  // Pemeriksaan sederhana untuk "http" atau "https"
  if (!driveUrl.startsWith('http://') && !driveUrl.startsWith('https://')) {
    console.warn(`Input bukan format URL yang valid: ${driveUrl}. Mengembalikan placeholder.`);
    return '/placeholder.svg'; // Jika bukan URL, itu tidak bisa menjadi tautan Google Drive
  }

  // Regex untuk mencocokkan ID file Google Drive dari tautan berbagi umum
  // Contoh: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    const fileId = match[1];
    // Ini adalah format tautan unduhan langsung untuk file Google Drive
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  console.warn(`Tidak dapat mengekstrak ID file Google Drive dari URL: ${driveUrl}. Mengembalikan URL asli.`);
  return driveUrl; // Ini hanya akan terjadi jika itu adalah URL http/https tetapi bukan tautan berbagi Google Drive yang dikenali
};