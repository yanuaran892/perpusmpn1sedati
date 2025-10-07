import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Loader2, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import BookFormDialog from '@/components/admin/BookFormDialog';
import { getImageUrl } from '@/utils/imageStorage';

interface BookItem {
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
}

interface CategoryItem {
  id_kategori: number;
  nama_kategori: string;
}

const AdminBookManagement = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]); // State for categories
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>('all'); // State for selected category filter

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedCategoryId]); // Re-fetch books when search term or category changes

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori')
        .select('id_kategori, nama_kategori')
        .order('nama_kategori', { ascending: true });

      if (error) {
        showError(error.message || 'Gagal mengambil kategori.');
        setCategories([]);
        return;
      }
      if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      showError('Terjadi kesalahan saat mengambil kategori.');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('buku')
        .select(`
          *,
          kategori (nama_kategori)
        `)
        .order('judul_buku', { ascending: true });

      if (searchTerm) {
        query = query.ilike('judul_buku', `%${searchTerm}%`);
      }

      if (selectedCategoryId && selectedCategoryId !== 'all') {
        query = query.eq('id_kategori', parseInt(selectedCategoryId));
      }

      const { data, error } = await query;

      if (error) {
        showError(error.message || 'Gagal mengambil data buku.');
        setBooks([]);
        return;
      }

      if (data) {
        const booksWithCategoryNames = data.map(book => ({
          ...book,
          nama_kategori: book.kategori?.nama_kategori || 'N/A'
        }));
        setBooks(booksWithCategoryNames);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data buku.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id_buku: number, judul_buku: string, gambar_buku_path: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus buku "${judul_buku}"?`)) {
      return;
    }
    try {
      // Delete image from storage if it's a Supabase Storage path
      if (gambar_buku_path && gambar_buku_path.startsWith('public/')) {
        const { error: storageError } = await supabase.storage
          .from('book_images')
          .remove([gambar_buku_path]);

        if (storageError) {
          console.warn('Gagal menghapus gambar dari storage:', storageError.message);
          // Continue with book deletion even if image deletion fails
        }
      }

      const { error } = await supabase
        .from('buku')
        .delete()
        .eq('id_buku', id_buku);

      if (error) {
        showError(error.message || 'Gagal menghapus buku.');
        return;
      }

      showSuccess(`Buku "${judul_buku}" berhasil dihapus.`);
      fetchBooks(); // Refresh list
    } catch (err) {
      console.error('Error deleting book:', err);
      showError('Terjadi kesalahan tak terduga saat menghapus buku.');
    }
  };

  const handleAddBook = () => {
    setBookToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleEditBook = (book: BookItem) => {
    setBookToEdit(book);
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setBookToEdit(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Buku</h1>
      <p className="text-gray-600">Kelola data buku yang tersedia di perpustakaan.</p>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-foreground">Daftar Buku</CardTitle>
          <Button onClick={handleAddBook} size="sm"> {/* Moved button here */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Buku
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan judul buku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId || ''}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id_kategori} value={String(category.id_kategori)}>
                    {category.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat buku...</p>
            </div>
          ) : books.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada buku ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Penerbit</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id_buku}>
                      <TableCell>
                        <img 
                          src={getImageUrl(book.gambar_buku)} 
                          alt={book.judul_buku} 
                          className="w-12 h-12 object-cover rounded-md" 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{book.judul_buku}</TableCell>
                      <TableCell>{book.penulis}</TableCell>
                      <TableCell>{book.nama_kategori}</TableCell>
                      <TableCell>{book.penerbit}</TableCell>
                      <TableCell>{book.jumlah_buku}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEditBook(book)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBook(book.id_buku, book.judul_buku, book.gambar_buku)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BookFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={fetchBooks}
        bookToEdit={bookToEdit}
      />
    </div>
  );
};

export default AdminBookManagement;