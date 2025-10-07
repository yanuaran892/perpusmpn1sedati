import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Search, Edit, Trash2, CheckCircle, XCircle, User, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    fetchGuestEntries();
    fetchVisitorCounts();
  }, [searchTerm]);

  const fetchGuestEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('buku_tamu')
        .select('*')
        .order('tanggal', { ascending: false })
        .order('waktu', { ascending: false });

      if (searchTerm) {
        query = query.or(`nama.ilike.%${searchTerm}%,kelas.ilike.%${searchTerm}%,tujuan.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        showError(error.message || 'Gagal mengambil entri pengunjung.');
        setGuestEntries([]);
        return;
      }
      if (data) {
        setGuestEntries(data);
      }
    } catch (err) {
      console.error('Error fetching guest entries:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil entri pengunjung.');
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
    if (!window.confirm(`Apakah Anda yakin ingin menghapus entri pengunjung dari "${nama}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('buku_tamu')
        .delete()
        .eq('id_tamu', id_tamu);

      if (error) {
        showError(error.message || 'Gagal menghapus entri pengunjung.');
        return;
      }

      showSuccess(`Entri pengunjung dari "${nama}" berhasil dihapus.`);
      fetchGuestEntries(); // Refresh list
      fetchVisitorCounts(); // Refresh counts
    } catch (err) {
      console.error('Error deleting guest entry:', err);
      showError('Terjadi kesalahan tak terduga saat menghapus entri pengunjung.');
    }
  };

  const handleToggleStatus = async (entry: GuestBookEntry) => {
    const newStatus = entry.status === 'berkunjung' ? 'selesai' : 'berkunjung';
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status kunjungan "${entry.nama}" menjadi "${newStatus}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('buku_tamu')
        .update({ status: newStatus })
        .eq('id_tamu', entry.id_tamu);

      if (error) {
        showError(error.message || 'Gagal mengubah status kunjungan.');
        return;
      }

      showSuccess(`Status kunjungan "${entry.nama}" berhasil diubah menjadi "${newStatus}".`);
      fetchGuestEntries(); // Refresh list
      fetchVisitorCounts(); // Refresh counts
    } catch (err) {
      console.error('Error toggling guest status:', err);
      showError('Terjadi kesalahan tak terduga saat mengubah status kunjungan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengunjung</h1>
        {/* Removed the button from here */}
      </div>
      <p className="text-gray-600">Kelola data pengunjung perpustakaan, termasuk siswa yang sedang aktif.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengunjung Hari Ini</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTodayVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {totalTodayVisitors === 0 ? 'Belum ada pengunjung' : `${totalTodayVisitors} pengunjung`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Berkunjung</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVisitors}</div>
            <p className="text-xs text-muted-foreground">{activeVisitors} pengunjung aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Berkunjung</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedVisitors}</div>
            <p className="text-xs text-muted-foreground">{finishedVisitors} kunjungan selesai</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Added flex for alignment */}
          <CardTitle className="text-2xl text-foreground">Daftar Pengunjung</CardTitle>
          <Button> {/* Moved button here */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengunjung
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari pengunjung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat entri pengunjung...</p>
            </div>
          ) : guestEntries.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Belum ada data pengunjung.</p>
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
                        <Button
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
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEntry(entry.id_tamu, entry.nama)}>
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
    </div>
  );
};

export default AdminVisitorManagement;