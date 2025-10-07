import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BorrowedBookItem {
  id_sirkulasi: number;
  id_buku: number;
  tanggal_pinjam: string; // Diubah menjadi string untuk menangani timestamp with time zone
  tanggal_kembali: string;
  status: string;
  judul_buku: string | null;
}

interface StudentBorrowedBooksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentNis: string | null;
  studentName: string | null;
}

const StudentBorrowedBooksDialog: React.FC<StudentBorrowedBooksDialogProps> = ({
  isOpen,
  onClose,
  studentNis,
  studentName,
}) => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentNis) {
      fetchBorrowedBooks(studentNis);
    } else {
      setBorrowedBooks([]); // Clear books when dialog is closed or studentNis is null
    }
  }, [isOpen, studentNis]);

  const fetchBorrowedBooks = async (nis: string) => {
    setLoading(true);
    try {
      // Use the new RPC function for admin to get borrowed books
      const { data, error } = await supabase.rpc('get_student_borrowed_books_for_admin', {
        p_id_nis: nis,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil daftar buku yang dipinjam.');
        setBorrowedBooks([]);
        return;
      }

      if (data) {
        // The RPC function already returns the data in the desired format
        setBorrowedBooks(data as BorrowedBookItem[]);
      }
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil daftar buku yang dipinjam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Buku Dipinjam oleh {studentName || 'Siswa Tidak Dikenal'}
          </DialogTitle>
          <DialogDescription>
            Daftar buku yang saat ini sedang dipinjam oleh siswa {studentName || 'Tidak Dikenal'} (NIS: {studentNis || 'Tidak Dikenal'}).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-lg text-gray-700">Memuat buku...</p>
            </div>
          ) : borrowedBooks.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">Siswa ini tidak sedang meminjam buku apapun.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead>Tanggal Pinjam</TableHead>
                  <TableHead>Tanggal Kembali</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowedBooks.map((book) => (
                  <TableRow key={book.id_sirkulasi}>
                    <TableCell className="font-medium">{book.judul_buku || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(book.tanggal_pinjam), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{format(new Date(book.tanggal_kembali), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.status === 'dipinjam' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StudentBorrowedBooksDialog;