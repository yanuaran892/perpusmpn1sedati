import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Search, Edit, Trash2, CheckCircle, XCircle, User, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

interface GuestBookEntry {
  id_tamu: number;
  id_nis: string | null;
  nama: string;
  kelas: string | null;
  tujuan: string | null;
  tanggal: string;
  waktu: string;
  status: string;
}

const AdminVisitorManagement = () => {
  const [guestEntries, setGuestEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalTodayVisitors, setTotalTodayVisitors] = useState(0);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [finishedVisitors, setFinishedVisitors] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGuestEntries();
    fetchVisitorCounts();
  }, [searchTerm, currentPage]); // Re-fetch on search term or page change

  const fetchGuestEntries = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;

      let query = supabase
        .from('buku_tamu')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('waktu', { ascending: false })
        .range(offset, offset + itemsPerPage - 1); // Supabase range is inclusive

      if (searchTerm) {
        query = query.or(`nama.ilike.%${searchTerm}%,kelas.ilike.%${searchTerm}%,tujuan.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        showError(error.message || 'Gagal mengambil entri siswa.');
        setGuestEntries([]);
        setTotalPages(1);
        return;
      }
      if (data) {
        setGuestEntries(data);
      }

      // Fetch total count for pagination
      let countQuery = supabase
        .from('buku_tamu')
        .select('*', { count: 'exact', head: true });

      if (searchTerm) {
        countQuery = countQuery.or(`nama.ilike.%${searchTerm}%,kelas.ilike.%${searchTerm}%,tujuan.ilike.%${searchTerm}%`);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error fetching total guest entry count:', countError);
        setTotalPages(1);
      } else {
        setTotalPages(Math.max(1, Math.ceil((count || 0) / itemsPerPage)));
      }

    } catch (err) {
      console.error('Error fetching guest entries:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil entri siswa.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorCounts = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Total Today Visitors
    const { count: todayCount, error: todayError } = await supabase
      .from('buku_tamu')
      .select('*', { count: 'exact' })
      .eq('tanggal', today);
    if (!todayError) setTotalTodayVisitors(todayCount || 0);

    // Active Visitors (status 'berkunjung')
    const { count: activeCount, error: activeError } = await supabase
      .from('buku_tamu')
      .select('*', { count: 'exact' })
      .eq('tanggal', today)
      .eq('status', 'berkunjung');
    if (!activeError) setActiveVisitors(activeCount || 0);

    // Finished Visitors (status 'selesai')
    const { count: finishedCount, error: finishedError } = await supabase
      .from('buku_tamu')
      .select('*', { count: 'exact' })
      .eq('tanggal', today)
      .eq('status', 'selesai');
    if (!finishedError) setFinishedVisitors(finishedCount || 0);
  };

  const handleDeleteEntry = async (id_tamu: number, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus entri siswa dari "${nama}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('buku_tamu')
        .delete()
        .eq('id_tamu', id_tamu);

      if (error) {
        showError(error.message || 'Gagal menghapus entri siswa.');
        return;
      }

      showSuccess(`Entri siswa dari "${nama}" berhasil dihapus.`);
      fetchGuestEntries(); // Refresh list
      fetchVisitorCounts(); // Refresh counts
    } catch (err) {
      console.error('Error deleting guest entry:', err);
      showError('Terjadi kesalahan tak terduga saat menghapus entri siswa.');
    }
  };

  const handleToggleStatus = async (entry: GuestBookEntry) => {
    const newStatus = entry.status === 'berkunjung' ? 'selesai' : 'berkunjung';
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status kunjungan siswa "${entry.nama}" menjadi "${newStatus}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('buku_tamu')
        .update({ status: newStatus })
        .eq('id_tamu', entry.id_tamu);

      if (error) {
        showError(error.message || 'Gagal mengubah status kunjungan siswa.');
        return;
      }

      showSuccess(`Status kunjungan siswa "${entry.nama}" berhasil diubah menjadi "${newStatus}".`);
      fetchGuestEntries(); // Refresh list
      fetchVisitorCounts(); // Refresh counts
    } catch (err) {
      console.error('Error toggling guest status:', err);
      showError('Terjadi kesalahan tak terduga saat mengubah status kunjungan siswa.');
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Siswa Berkunjung</h1>
        {/* Removed the button from here */}
      </div>
      <p className="text-gray-600">Kelola data siswa yang berkunjung ke perpustakaan, termasuk siswa yang sedang aktif.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa Berkunjung Hari Ini</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTodayVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTodayVisitors === 0 ? 'Belum ada siswa berkunjung' : `${totalTodayVisitors} siswa`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa Sedang Berkunjung</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVisitors}</div>
            <p className="text-xs text-muted-foreground">{activeVisitors} siswa aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunjungan Siswa Selesai</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedVisitors}</div>
            <p className="text-xs text-muted-foreground">{finishedVisitors} kunjungan siswa selesai</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Added flex for alignment */}
          <CardTitle className="text-2xl text-foreground">Daftar Siswa Berkunjung</CardTitle>
          <GSAPButton> {/* Moved button here */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Siswa Berkunjung
          </GSAPButton>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat entri siswa...</p>
            </div>
          ) : guestEntries.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Belum ada data siswa berkunjung.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestEntries.map((entry) => (
                    <TableRow key={entry.id_tamu}>
                      <TableCell className="font-medium">{entry.nama}</TableCell>
                      <TableCell>{entry.kelas || '-'}</TableCell>
                      <TableCell>{entry.tujuan || '-'}</TableCell>
                      <TableCell>{format(new Date(entry.tanggal), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{entry.waktu.substring(0, 5)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          entry.status === 'berkunjung' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {entry.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <GSAPButton
                          variant="ghost"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleToggleStatus(entry)}
                        >
                          {entry.status === 'berkunjung' ? (
                            <CheckCircle className="h-4 w-4 text-accent" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </GSAPButton>
                        <GSAPButton variant="destructive" size="sm" onClick={() => handleDeleteEntry(entry.id_tamu, entry.nama)}>
                          <Trash2 className="h-4 w-4" />
                        </GSAPButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center space-x-2 mt-4">
                <GSAPButton
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </GSAPButton>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <GSAPButton
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </GSAPButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVisitorManagement;