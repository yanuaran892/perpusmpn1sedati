import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, setHours, setMinutes, startOfDay } from 'date-fns'; // Import startOfDay
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/utils/imageStorage';
import TimePicker from '@/components/TimePicker'; // Import TimePicker

interface BookDetailDialogProps {
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
    nama_kategori?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBorrow: (bookId: number, bookTitle: string, returnDate: Date) => void;
  isBorrowDisabled: boolean;
  isBorrowing: boolean;
}

const BookDetailDialog: React.FC<BookDetailDialogProps> = ({
  book,
  isOpen,
  onClose,
  onConfirmBorrow,
  isBorrowDisabled,
  isBorrowing,
}) => {
  const [imageError, setImageError] = useState(false);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  useEffect(() => {
    if (isOpen) {
      // Set default return date to 3 days from now when dialog opens
      const now = new Date();
      setReturnDate(addDays(now, 3));
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());
      setImageError(false); // Reset image error when dialog opens
    }
  }, [isOpen]);

  if (!book) return null;

  const availableCopies = parseInt(book.jumlah_buku || '0') || 0;
  
  const processedImageUrl = getImageUrl(book.gambar_buku);
  const imageUrl = imageError ? '/placeholder.svg' : processedImageUrl;

  console.log(`BookDetailDialog: Book ID ${book.id_buku}, Original Image Source: ${book.gambar_buku}`);
  console.log(`BookDetailDialog: Book ID ${book.id_buku}, Processed Image URL: ${processedImageUrl}`);
  console.log(`BookDetailDialog: Book ID ${book.id_buku}, Final Image URL (after error check): ${imageUrl}`);

  const handleConfirm = () => {
    if (book && returnDate) {
      // Combine selected date with selected time
      let finalReturnDate = setHours(returnDate, selectedHour);
      finalReturnDate = setMinutes(finalReturnDate, selectedMinute);
      onConfirmBorrow(book.id_buku, book.judul_buku, finalReturnDate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-y-auto"> {/* Added overflow-y-auto here */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{book.judul_buku}</DialogTitle>
          <DialogDescription className="text-gray-600">Detail lengkap buku ini.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4"> {/* Removed h-full */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="flex justify-center items-center">
              <img
                src={imageUrl}
                alt={book.judul_buku}
                className="w-full max-w-xs h-auto object-contain rounded-lg shadow-md"
                onError={() => {
                  console.error(`BookDetailDialog: Failed to load image for Book ID ${book.id_buku} from URL: ${imageUrl}`);
                  setImageError(true);
                }}
              />
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>Penulis:</strong> {book.penulis}</p>
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Kategori:</strong> <span className="font-medium text-primary">{book.nama_kategori || 'Umum'}</span></p>
              <p><strong>Tahun Terbit:</strong> {book.tahun_terbit}</p>
              <p><strong>Penerbit:</strong> {book.penerbit}</p>
              <p><strong>Kota Terbit:</strong> {book.kota_terbit}</p>
              <p><strong>No. Klasifikasi:</strong> {book.no_klasifikasi}</p>
              <p><strong>Kode Rak:</strong> {book.kode_rak}</p>
              <p><strong>Jumlah Tersedia:</strong> <span className="font-semibold text-lg">{availableCopies}</span></p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-primary mb-2">Sinopsis:</h4>
            <p className="text-gray-800 leading-relaxed">{book.sinopsis || 'Tidak ada sinopsis tersedia.'}</p>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-primary mb-2">Pilih Tanggal & Waktu Pengembalian:</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(setHours(setMinutes(returnDate, selectedMinute), selectedHour), "PPP HH:mm") : <span>Pilih tanggal & waktu</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                  disabled={(date) => date < startOfDay(new Date()) || date > addDays(new Date(), 3)} // Allow today, max 3 days loan
                />
                <TimePicker
                  selectedHour={selectedHour}
                  onSelectHour={setSelectedHour}
                  selectedMinute={selectedMinute}
                  onSelectMinute={setSelectedMinute}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-gray-500 mt-2">Buku dapat dipinjam maksimal 3 hari. Waktu pengembalian yang dipilih akan dicatat, namun perlu diingat bahwa database saat ini hanya menyimpan tanggal pengembalian yang diharapkan.</p>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button
            onClick={handleConfirm}
            disabled={isBorrowDisabled || availableCopies <= 0 || isBorrowing || !returnDate}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {isBorrowing ? 'Meminjam...' : (availableCopies <= 0 ? 'Tidak Tersedia' : 'Pinjam Buku Ini')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailDialog;