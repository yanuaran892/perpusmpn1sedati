import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getImageUrl } from '@/utils/imageStorage'; // Import the new utility function

interface BookCardProps {
  book: {
    id_buku: number;
    isbn: string;
    penulis: string;
    tahun_terbit: string;
    judul_buku: string;
    kota_terbit: string;
    penerbit: string;
    no_klasifikasi: string;
    jumlah_buku: string;
    kode_rak: string;
    gambar_buku: string;
    sinopsis: string;
    id_kategori: number;
    nama_kategori?: string; // Added for display
  };
  onViewDetails: (book: BookCardProps['book']) => void;
  isBorrowDisabled: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onViewDetails, isBorrowDisabled }) => {
  const availableCopies = parseInt(book.jumlah_buku || '0') || 0;
  const [imageError, setImageError] = useState(false);

  // Use the new getImageUrl function
  const processedImageUrl = getImageUrl(book.gambar_buku);

  // Use placeholder if there's an image error, otherwise use the processed URL
  const imageUrl = imageError ? '/placeholder.svg' : processedImageUrl;

  console.log(`BookCard: Book ID ${book.id_buku}, Original Image Source: ${book.gambar_buku}`);
  console.log(`BookCard: Book ID ${book.id_buku}, Processed Image URL: ${processedImageUrl}`);
  console.log(`BookCard: Book ID ${book.id_buku}, Final Image URL (after error check): ${imageUrl}`);


  return (
    <Card className="group flex flex-col justify-between h-full shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="w-full h-48 flex items-center justify-center rounded-t-lg overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={book.judul_buku}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => {
            console.error(`BookCard: Failed to load image for Book ID ${book.id_buku} from URL: ${imageUrl}`);
            setImageError(true);
          }}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">{book.judul_buku}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-1">Oleh: {book.penulis}</p>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 flex-grow">
        <p className="mb-1">ISBN: {book.isbn}</p>
        <p className="mb-1">Kategori: <span className="font-medium text-primary">{book.nama_kategori || 'Umum'}</span></p>
        <p className="mb-1">Tahun Terbit: {book.tahun_terbit}</p>
        <p className="mb-1">Penerbit: {book.penerbit}</p>
        <p className="mb-1">Jumlah Tersedia: <span className="font-semibold">{availableCopies}</span></p>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={() => onViewDetails(book)}
          disabled={isBorrowDisabled || availableCopies <= 0}
          className="w-full bg-accent hover:bg-accent/90 text-white"
        >
          {availableCopies <= 0 ? 'Tidak Tersedia' : 'Lihat Detail & Pinjam'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookCard;