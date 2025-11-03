import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { supabase } from '@/integrations/supabase/client';
import GSAPButton from '@/components/GSAPButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Book, LayoutGrid, BookOpen, Search, User, LogOut, Bell, Settings, Star, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { isPast, format, parseISO } from 'date-fns';
import BookCard from '@/components/BookCard';
import BookDetailDialog from '@/components/BookDetailDialog';
import BookCardSkeleton from '@/components/BookCardSkeleton';
import AnimatedStatCard from '@/components/AnimatedStatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const pageSize = 6;
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>('all');
  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<BookItem | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [notifications, setNotifications] = useState<{type: string, message: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

    const newNotifications = [];

    if (student.total_denda > 0) {
      newNotifications.push({
        type: 'denda',
        message: `Anda memiliki denda sebesar Rp ${student.total_denda.toLocaleString('id-ID')}. Mohon segera selesaikan.`
      });
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
        newNotifications.push({
          type: 'keterlambatan',
          message: `Anda memiliki ${overdueBooks.length} buku yang terlambat dikembalikan: ${overdueTitles}. Mohon segera kembalikan.`
        });
      }
    } catch (err) {
      console.error('Error checking overdue books:', err);
    }

    if (newNotifications.length > 0) {
      setNotifications(newNotifications);
      setShowNotifications(true);
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
    setCurrentPage(1);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    setNotifications([]);
  };

  if (authLoading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-2xl text-gray-700 font-medium">Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg">
                <Book className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Perpustakaan Digital</h1>
                <p className="text-sm text-gray-600">SMPN 1 Sedati</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari buku berdasarkan judul, penulis, atau ISBN..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-300"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 relative"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                        <h3 className="text-white font-semibold">Notifikasi</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification, index) => (
                            <div 
                              key={index} 
                              className={cn(
                                "p-4 border-b border-gray-100",
                                notification.type === 'denda' ? 'bg-red-50' : 'bg-yellow-50'
                              )}
                            >
                              <div className="flex items-start">
                                {notification.type === 'denda' ? (
                                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                                )}
                                <p className="text-sm text-gray-700">{notification.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-gray-500">Tidak ada notifikasi</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-50 flex justify-end">
                        <button
                          onClick={handleNotificationClose}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Tutup
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-2">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{student.nama}</p>
                  <p className="text-xs text-gray-500">{student.kelas}</p>
                </div>
                <button 
                  onClick={handleProfileClick}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  <User className="h-6 w-6" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Selamat Datang, {student.nama}!</h2>
                <p className="text-blue-100 text-lg">Jelajahi ribuan koleksi buku digital dan fisik kami</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-100">Buku Dipinjam</p>
                  <p className="text-2xl font-bold">{student.sedang_pinjam}/{student.max_peminjaman}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-100">Total Denda</p>
                  <p className="text-2xl font-bold">Rp {student.total_denda.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          <AnimatedStatCard icon={Book} label="Total Buku" value={totalBooksCount} animationDelay={0} />
          <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={totalCategoriesCount} animationDelay={0.1} />
          <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.2} />
        </motion.div>

        {/* Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-none bg-white/80 backdrop-blur-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Koleksi Buku</CardTitle>
                <p className="text-gray-600">Temukan buku favoritmu di sini</p>
              </div>
              <div className="w-full md:w-auto">
                <Select onValueChange={(value) => { setSelectedCategoryId(value); setCurrentPage(1); }} value={selectedCategoryId || ''}>
                  <SelectTrigger className="w-full md:w-[220px] shadow-sm text-base bg-white">
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
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingBooks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <BookCardSkeleton key={index} />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada buku ditemukan</h3>
                  <p className="mt-2 text-gray-500">Coba ubah kata kunci pencarian atau filter kategori</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book, index) => (
                      <motion.div
                        key={book.id_buku}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="transform transition-all duration-300"
                      >
                        <BookCard
                          book={book}
                          onViewDetails={handleViewBookDetails}
                          isBorrowDisabled={student.sedang_pinjam >= student.max_peminjaman}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-center items-center space-x-3 mt-10">
                    <GSAPButton
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="bg-white hover:bg-gray-50 text-gray-700 shadow-sm px-4 py-2 rounded-xl"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </GSAPButton>
                    <span className="text-lg text-gray-700 font-medium">Halaman {currentPage} dari {totalPages}</span>
                    <GSAPButton
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="bg-white hover:bg-gray-50 text-gray-700 shadow-sm px-4 py-2 rounded-xl"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </GSAPButton>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

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