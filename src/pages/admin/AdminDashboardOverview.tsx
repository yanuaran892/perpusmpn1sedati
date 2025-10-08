import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Book, Users, BookOpen, TrendingUp, Loader2, CalendarDays, User, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';
import MonthlyBorrowChart from '@/components/admin/charts/MonthlyBorrowChart';
import CategoryDistributionChart from '@/components/admin/charts/CategoryDistributionChart';
import DailyVisitorChart from '@/components/admin/charts/DailyVisitorChart';

interface Activity {
  type: 'borrow' | 'return' | 'fine';
  message: string;
  time: string;
}

interface PopularBook {
  judul_buku: string;
  borrow_count: number;
  status: 'Populer' | 'Trending';
}

interface AdminCirculationItem {
  id_sirkulasi: number;
  id_nis: string;
  id_buku: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  tanggal_dikembalikan: string | null;
  status: string;
  denda: number;
  judul_buku: string | null;
  siswa_nama: string | null;
}

interface StudentItem {
  id_nis: string;
  nama: string;
  kelas: string;
  email: string | null;
  total_pinjam: number;
  sedang_pinjam: number;
  max_peminjaman: number;
  total_denda: number;
  status_siswa: string;
  status_peminjaman: string;
}

interface GuestBookItem {
  id_tamu: number;
  id_nis: string | null;
  nama: string;
  kelas: string | null;
  tujuan: string | null;
  tanggal: string;
  waktu: string;
  status: string;
}

const AdminDashboardOverview = () => {
  const { admin } = useAdminAuth();
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalRegisteredStudents, setTotalRegisteredStudents] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [activeStudentsInLibrary, setActiveStudentsInLibrary] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [totalFineIncome, setTotalFineIncome] = useState(0); // New state for total fine income
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Total Books
      const { count: booksCount, error: booksError } = await supabase
        .from('buku')
        .select('*', { count: 'exact' });
      if (!booksError) setTotalBooks(booksCount || 0);
      else console.error('Error fetching total books:', booksError);

      // Total Registered Students using RPC
      const { data: studentsData, error: studentsError } = await supabase.rpc('get_all_siswa_for_admin');
      if (!studentsError && studentsData) {
        setTotalRegisteredStudents(studentsData.length);
      } else {
        console.error('Error fetching total registered students:', studentsError);
        showError(studentsError?.message || 'Gagal mengambil data siswa terdaftar.');
        setTotalRegisteredStudents(0);
      }

      // Active Students in Library (from buku_tamu with status 'berkunjung' for today)
      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: activeVisitorsCount, error: activeVisitorsError } = await supabase
        .from('buku_tamu')
        .select('*', { count: 'exact' })
        .eq('tanggal', today)
        .eq('status', 'berkunjung');
      if (!activeVisitorsError) setActiveStudentsInLibrary(activeVisitorsCount || 0);
      else console.error('Error fetching active students in library:', activeVisitorsError);

      // Borrowed Books & Recent Activities using new RPC
      const { data: circulationData, error: circulationError } = await supabase.rpc('get_admin_dashboard_circulation_data');
      if (!circulationError && circulationData) {
          const borrowed = circulationData.filter((item: AdminCirculationItem) => item.status === 'dipinjam');
          setBorrowedBooks(borrowed.length);

          const recentCirculationData = (circulationData as AdminCirculationItem[])
              .sort((a, b) => new Date(b.tanggal_pinjam).getTime() - new Date(a.tanggal_pinjam).getTime())
              .slice(0, 5);

          const activities: Activity[] = recentCirculationData.map(item => {
              const studentName = item.siswa_nama || 'Siswa Tidak Dikenal';
              const bookTitle = item.judul_buku || 'Buku Tidak Dikenal';
              const timestamp = item.tanggal_dikembalikan || item.tanggal_pinjam;

              let message = '';
              let type: 'borrow' | 'return' | 'fine' = 'borrow';

              if (item.status === 'dikembalikan') {
                  message = `${studentName} mengembalikan "${bookTitle}"`;
                  type = 'return';
                  if (item.denda > 0) {
                      message += ` dengan denda Rp ${item.denda.toLocaleString('id-ID')}`;
                      type = 'fine';
                  }
              } else if (item.status === 'dipinjam') {
                  message = `${studentName} meminjam "${bookTitle}"`;
                  type = 'borrow';
              }

              const jakartaTime = formatInTimeZone(new Date(timestamp), 'Asia/Jakarta', 'dd MMM yyyy HH:mm', { locale: id });

              return {
                  type: type,
                  message: message,
                  time: jakartaTime,
              };
          });
          setRecentActivities(activities);
      } else {
          console.error('Error fetching circulation data for admin dashboard:', circulationError);
          showError(circulationError?.message || 'Gagal mengambil data sirkulasi untuk dashboard.');
          setBorrowedBooks(0);
          setRecentActivities([]);
      }

      // Total Fine Income (sum of approved payments)
      const { data: finePayments, error: fineError } = await supabase
        .from('pembayaran_denda')
        .select('jumlah_bayar')
        .eq('status_pembayaran', 'approved');

      if (!fineError && finePayments) {
        const totalAmount = finePayments.reduce((sum, payment) => sum + payment.jumlah_bayar, 0);
        setTotalFineIncome(totalAmount);
        console.log('Fetched approved fine payments:', finePayments); // Log data
        console.log('Calculated total fine income:', totalAmount); // Log total
      } else {
        console.error('Error fetching total fine income:', fineError);
        showError(fineError?.message || 'Gagal mengambil data pendapatan denda.');
        setTotalFineIncome(0);
      }

      // Popular Books (empty for now, will be populated based on actual borrowing counts later)
      setPopularBooks([]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showError('Gagal memuat data dashboard.');
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl text-gray-700">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground animate-fade-in-up">Selamat Datang, {admin?.username || 'Admin'}!</h1>
          <p className="text-lg text-gray-600 mt-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Ringkasan aktivitas perpustakaan Anda hari ini.</p>
        </div>
        <div className="hidden md:flex items-center text-gray-500 text-sm">
          <CalendarDays className="h-5 w-5 mr-2" />
          <span>{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-l-4 border-primary animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Buku</CardTitle>
            <Book className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalBooks}</div>
            <p className="text-xs text-muted-foreground mt-1">Jumlah koleksi buku</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-l-4 border-accent animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Siswa</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalRegisteredStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Siswa terdaftar di sistem</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-l-4 border-yellow-500 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Buku Dipinjam</CardTitle>
            <BookOpen className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{borrowedBooks}</div>
            <p className="text-xs text-muted-foreground mt-1">Buku sedang dalam peminjaman</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-l-4 border-purple-500 animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Siswa Aktif di Perpustakaan</CardTitle>
            <User className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeStudentsInLibrary}</div>
            <p className="text-xs text-muted-foreground mt-1">Pengunjung aktif hari ini</p>
          </CardContent>
        </Card>
        {/* New Card for Total Fine Income */}
        <Card className="shadow-lg border-l-4 border-orange-500 animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Pendapatan Denda</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">Rp {totalFineIncome.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Total denda yang telah disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* New section for Charts */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>Analisis Data Perpustakaan</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <MonthlyBorrowChart />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <CategoryDistributionChart />
          </div>
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
            <DailyVisitorChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Aktivitas Terbaru</CardTitle>
            <CardDescription>Peminjaman dan pengembalian buku terbaru.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-center text-gray-600 py-4">Tidak ada aktivitas terbaru.</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 animate-slide-in-left" style={{ animationDelay: `${1.2 + index * 0.05}s` }}>
                    <div className={cn(
                      "h-3 w-3 rounded-full mr-3 flex-shrink-0",
                      activity.type === 'borrow' && 'bg-accent',
                      activity.type === 'return' && 'bg-primary',
                      activity.type === 'fine' && 'bg-orange-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" /> {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Buku Populer</CardTitle>
            <CardDescription>Buku yang paling sering dipinjam bulan ini.</CardDescription>
          </CardHeader>
          <CardContent>
            {popularBooks.length === 0 ? (
              <p className="text-center text-gray-600 py-4">Data buku populer akan muncul di sini setelah ada aktivitas peminjaman.</p>
            ) : (
              <div className="space-y-4">
                {popularBooks.map((book, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 animate-slide-in-right" style={{ animationDelay: `${1.4 + index * 0.05}s` }}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{book.judul_buku}</p>
                      <p className="text-xs text-muted-foreground mt-1">Dipinjam {book.borrow_count} kali</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 text-xs font-semibold rounded-full",
                      book.status === 'Populer' && 'bg-primary/10 text-primary',
                      book.status === 'Trending' && 'bg-accent/10 text-accent'
                    )}>
                      {book.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;