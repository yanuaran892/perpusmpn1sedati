import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import GSAPButton from '@/components/GSAPButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { isPast } from 'date-fns';
import BookCard from '@/components/BookCard';
import BookDetailDialog from '@/components/BookDetailDialog';
import BookCardSkeleton from '@/components/BookCardSkeleton';
import StudentDashboardHeader from '@/components/student/StudentDashboardHeader';
import AnimatedStatCard from '@/components/AnimatedStatCard'; // Import AnimatedStatCard

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

interface OverdueBookQueryResult {
  tanggal_kembali: string;
  buku: {
    judul_buku: string;
  }[] | null;
}

const Dashboard = () => {
  const { student, isLoading: authLoading, logout, updateStudent } = useStudentAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>('all');
  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<BookItem | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/login');
    } else if (student) {
      fetchCategories();
      fetchBooks();
      fetchCounts();
      checkStudentStatusAndAlerts();
    }
  }, [student, authLoading, navigate, currentPage, searchTerm, selectedCategoryId]);

  const fetchCounts = async () => {
    try {
      const { count: booksCount, error: booksError } = await supabase
        .from('buku')
        .select('*', { count: 'exact' });
      if (!booksError) {
        setTotalBooksCount(booksCount || 0);
      }

      const { count: categoriesCount, error: categoriesError } = await supabase
        .from('kategori')
        .select('*', { count: 'exact' });
      if (!categoriesError) {
        setTotalCategoriesCount(categoriesCount || 0);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori')
        .select('id_kategori, nama_kategori');

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
    setLoadingBooks(true);
    try {
      await supabase.rpc('set_config', { key: 'app.current_nis', value: student?.id_nis });

      const categoryId = selectedCategoryId && selectedCategoryId !== 'all' ? parseInt(selectedCategoryId) : null;

      const { data, error } = await supabase.rpc('search_buku', {
        searchkey: searchTerm,
        limit_value: pageSize,
        offset_value: (currentPage - 1) * pageSize,
        category_id: categoryId,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil buku.');
        setBooks([]);
        setTotalPages(1);
        return;
      }

      if (data) {
        const booksWithCategories = data.map((book: BookItem) => {
          const category = categories.find(cat => cat.id_kategori === book.id_kategori);
          return { ...book, nama_kategori: category?.nama_kategori || 'Umum' };
        });
        setBooks(booksWithCategories);

        let countQuery = supabase
          .from('buku')
          .select('*', { count: 'exact' })
          .ilike('judul_buku', `%${searchTerm}%`);

        if (categoryId !== null) {
          countQuery = countQuery.eq('id_kategori', categoryId);
        }

        const { count } = await countQuery;
        setTotalPages(Math.max(1, Math.ceil((count || 0) / pageSize)));
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil buku.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const checkStudentStatusAndAlerts = async () => {
    if (!student?.id_nis) return;

    if (student.total_denda > 0) {
      showError(`Anda memiliki denda sebesar Rp ${student.total_denda.toLocaleString('id-ID')}. Mohon segera selesaikan.`);
    }

    try {
      await supabase.rpc('set_config', { key: 'app.current_nis', value: student.id_nis });
      const { data: circulationData, error } = await supabase
        .from('sirkulasi')
        .select('tanggal_kembali, buku(judul_buku)')
        .eq('id_nis', student.id_nis)
        .eq('status', 'dipinjam');

      if (error) {
        console.error('Error fetching circulation for overdue check:', error);
        return;
      }

      const overdueBooks = (circulationData as OverdueBookQueryResult[])?.filter(item => isPast(new Date(item.tanggal_kembali)));

      if (overdueBooks && overdueBooks.length > 0) {
        const overdueTitles = overdueBooks.map(item => item.buku?.[0]?.judul_buku || 'Buku Tidak Dikenal').join(', ');
        showError(`Anda memiliki ${overdueBooks.length} buku yang terlambat dikembalikan: ${overdueTitles}. Mohon segera kembalikan.`);
      }
    } catch (err) {
      console.error('Error checking overdue books:', err);
    }
  };

  const handleViewBookDetails = (book: BookItem) => {
    setSelectedBookForDetail(book);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedBookForDetail(null);
  };

  const handleConfirmBorrow = async (bookId: number, bookTitle: string, selectedReturnDate: Date) => {
    if (!student) {
      showError('Anda harus login untuk meminjam buku.');
      return;
    }

    setIsBorrowing(true);
    try {
      const { data, error } = await supabase.rpc('borrow_book', {
        p_id_nis: student.id_nis,
        p_id_buku: bookId,
        p_tanggal_pinjam: new Date(),
        p_tanggal_kembali: selectedReturnDate,
      });

      if (error) {
        showError(error.message || 'Gagal mengirim permintaan peminjaman.');
        return;
      }
      
      if (data === false) {
        showError('Gagal mengirim permintaan peminjaman. Terjadi kesalahan tak terduga.');
        return;
      }

      showSuccess(`Permintaan peminjaman buku "${bookTitle}" berhasil dikirim! Menunggu persetujuan admin.`);
      fetchBooks(); 
      handleCloseDetailDialog();
    } catch (err) {
      console.error('Error borrowing book:', err);
      showError('Terjadi kesalahan saat mengirim permintaan peminjaman buku.');
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  if (authLoading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-700">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentDashboardHeader
        studentName={student.nama}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        totalBooksCount={totalBooksCount}
        totalCategoriesCount={totalCategoriesCount}
      />

      {/* Stat Cards - Now placed directly after the header */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20"> {/* Negative margin-top to pull it up, z-20 for visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <AnimatedStatCard icon={Book} label="Total Buku" value={totalBooksCount} animationDelay={0.3} />
          <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={totalCategoriesCount} animationDelay={0.4} />
          <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.5} />
        </div>
      </div>

      {/* Main content area, adjusted for header height and overlapping cards */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto mt-10 relative z-10"> {/* Adjusted margin-top to clear stat cards */}
        <Card className="shadow-xl border-none animate-fade-in-up">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4">
            <CardTitle className="text-3xl font-bold text-foreground">Koleksi Buku</CardTitle>
            <Select onValueChange={(value) => { setSelectedCategoryId(value); setCurrentPage(1); }} value={selectedCategoryId || ''}>
              <SelectTrigger className="w-full md:w-[220px] shadow-sm text-base">
                <SelectValue placeholder="Filter Kategori" />
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
          </CardHeader>
          <CardContent className="pt-6">
            {loadingBooks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <BookCardSkeleton key={index} />
                ))}
              </div>
            ) : books.length === 0 ? (
              <p className="text-center text-gray-600 py-12 text-lg">Tidak ada buku ditemukan.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {books.map((book, index) => (
                    <div key={book.id_buku} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                      <BookCard
                        book={book}
                        onViewDetails={handleViewBookDetails}
                        isBorrowDisabled={student.sedang_pinjam >= student.max_peminjaman}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center space-x-3 mt-10 animate-fade-in-up" style={{ animationDelay: `${0.9 + books.length * 0.05 + 0.1}s` }}>
                  <GSAPButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="bg-primary/5 hover:bg-primary/10 text-primary shadow-sm px-4 py-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </GSAPButton>
                  <span className="text-lg text-gray-700 font-medium">Halaman {currentPage} dari {totalPages}</span>
                  <GSAPButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="bg-primary/5 hover:bg-primary/10 text-primary shadow-sm px-4 py-2"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </GSAPButton>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Book Detail Dialog */}
      <BookDetailDialog
        book={selectedBookForDetail}
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        onConfirmBorrow={handleConfirmBorrow}
        isBorrowDisabled={student.sedang_pinjam >= student.max_peminjaman}
        isBorrowing={isBorrowing}
      />
    </div>
  );
};

export default Dashboard;