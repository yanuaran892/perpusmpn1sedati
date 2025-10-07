import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, CheckCircle, XCircle, Eye, DollarSign, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminAddFineDialog from '@/components/admin/AdminAddFineDialog'; // Import the new dialog

interface FinePaymentRequest {
  id_pembayaran: number;
  id_nis: string;
  siswa_nama: string;
  siswa_kelas: string;
  jumlah_bayar: number;
  tanggal_bayar: string;
  status_pembayaran: string;
  bukti_pembayaran_url: string | null;
  created_at: string;
}

const AdminFineManagement = () => {
  const { admin } = useAdminAuth();
  const [pendingPayments, setPendingPayments] = useState<FinePaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<number | null>(null); // To track which request is being processed
  const [isCalculatingFines, setIsCalculatingFines] = useState(false); // New state for fine calculation loading
  const [totalPendingFineAmount, setTotalPendingFineAmount] = useState<number>(0); // New state for total pending fine

  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [currentProofUrl, setCurrentProofUrl] = useState<string | null>(null);

  // State for the new manual fine dialog
  const [isAddFineDialogOpen, setIsAddFineDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, [searchTerm]);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_fine_payments_for_admin');

      if (error) {
        showError(error.message || 'Gagal mengambil permintaan pembayaran denda.');
        setPendingPayments([]);
        setTotalPendingFineAmount(0);
        return;
      }

      if (data) {
        const filteredData = (data as FinePaymentRequest[]).filter(item => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (item.siswa_nama && item.siswa_nama.toLowerCase().includes(searchLower)) ||
            (item.id_nis && item.id_nis.toLowerCase().includes(searchLower)) ||
            (item.siswa_kelas && item.siswa_kelas.toLowerCase().includes(searchLower))
          );
        });
        setPendingPayments(filteredData);
        const totalAmount = filteredData.reduce((sum, payment) => sum + payment.jumlah_bayar, 0);
        setTotalPendingFineAmount(totalAmount);
      }
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil permintaan pembayaran denda.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (payment: FinePaymentRequest) => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI pembayaran denda sebesar Rp ${payment.jumlah_bayar.toLocaleString('id-ID')} dari ${payment.siswa_nama} (NIS: ${payment.id_nis})?`)) {
      return;
    }

    setIsProcessing(payment.id_pembayaran);
    try {
      const { data, error } = await supabase.rpc('approve_fine_payment', {
        p_id_pembayaran: payment.id_pembayaran,
        p_admin_id: admin.id,
        p_admin_username: admin.username,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menyetujui pembayaran denda.');
        return;
      }

      showSuccess(`Pembayaran denda dari ${payment.siswa_nama} berhasil disetujui!`);
      fetchPendingPayments(); // Refresh list
    } catch (err) {
      console.error('Error approving fine payment:', err);
      showError('Terjadi kesalahan saat menyetujui pembayaran denda.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectPayment = async (payment: FinePaymentRequest) => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin MENOLAK pembayaran denda sebesar Rp ${payment.jumlah_bayar.toLocaleString('id-ID')} dari ${payment.siswa_nama} (NIS: ${payment.id_nis})?`)) {
      return;
    }

    setIsProcessing(payment.id_pembayaran);
    try {
      const { data, error } = await supabase.rpc('reject_fine_payment', {
        p_id_pembayaran: payment.id_pembayaran,
        p_admin_id: admin.id,
        p_admin_username: admin.username,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menolak pembayaran denda.');
        return;
      }

      showSuccess(`Pembayaran denda dari ${payment.siswa_nama} berhasil ditolak.`);
      fetchPendingPayments(); // Refresh list
    } catch (err) {
      console.error('Error rejecting fine payment:', err);
      showError('Terjadi kesalahan saat menolak pembayaran denda.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleViewProof = (url: string | null) => {
    if (url) {
      setCurrentProofUrl(url);
      setIsProofDialogOpen(true);
    } else {
      showError('Tidak ada bukti pembayaran yang diunggah.');
    }
  };

  const handleCalculateOverdueFines = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghitung dan menerapkan denda untuk semua buku yang terlambat dikembalikan?')) {
      return;
    }
    setIsCalculatingFines(true);
    try {
      const { error } = await supabase.rpc('calculate_and_apply_overdue_fines');

      if (error) {
        showError(error.message || 'Gagal menghitung dan menerapkan denda keterlambatan.');
        return;
      }
      showSuccess('Denda keterlambatan berhasil dihitung dan diterapkan!');
      fetchPendingPayments(); // Refresh pending payments, as student total_denda might change
    } catch (err) {
      console.error('Error calculating overdue fines:', err);
      showError('Terjadi kesalahan tak terduga saat menghitung denda keterlambatan.');
    } finally {
      setIsCalculatingFines(false);
    }
  };

  const handleOpenAddFineDialog = () => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }
    setIsAddFineDialogOpen(true);
  };

  const handleCloseAddFineDialog = () => {
    setIsAddFineDialogOpen(false);
  };

  const handleManualFineAdded = () => {
    fetchPendingPayments();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Denda</h1>
      <p className="text-gray-600">Kelola permintaan pembayaran denda dari siswa dan tambahkan denda manual.</p>

      {/* New: Fine Summary Card */}
      <Card className="shadow-lg border-l-4 border-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-foreground">Ringkasan Denda</CardTitle>
          <DollarSign className="h-6 w-6 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">Rp {totalPendingFineAmount.toLocaleString('id-ID')}</div>
          <p className="text-sm text-muted-foreground mt-1">Total denda yang menunggu persetujuan</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-foreground">Perhitungan Denda Otomatis</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={handleCalculateOverdueFines}
              disabled={isCalculatingFines}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isCalculatingFines ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghitung...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" /> Hitung Denda Terlambat
                </>
              )}
            </Button>
            <Button
              onClick={handleOpenAddFineDialog}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Denda Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Klik tombol "Hitung Denda Terlambat" untuk menghitung dan menerapkan denda secara otomatis untuk semua buku yang sudah melewati tanggal pengembalian. Gunakan "Tambah Denda Manual" untuk menambahkan denda secara langsung.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Permintaan Pembayaran Denda (Pending)</CardTitle>
          <CardDescription>Daftar pembayaran denda yang menunggu persetujuan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari siswa, NIS, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat permintaan pembayaran...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada permintaan pembayaran denda yang tertunda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Jumlah Bayar</TableHead>
                    <TableHead>Tanggal Permintaan</TableHead>
                    <TableHead>Bukti Pembayaran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id_pembayaran}>
                      <TableCell className="font-medium">{payment.id_nis}</TableCell>
                      <TableCell>{payment.siswa_nama}</TableCell>
                      <TableCell>{payment.siswa_kelas}</TableCell>
                      <TableCell>Rp {payment.jumlah_bayar.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{format(new Date(payment.created_at), 'dd MMM yyyy HH:mm', { locale: id })}</TableCell>
                      <TableCell>
                        {payment.bukti_pembayaran_url ? (
                          <Button variant="outline" size="sm" onClick={() => handleViewProof(payment.bukti_pembayaran_url)}>
                            <Eye className="h-4 w-4 mr-1" /> Lihat Bukti
                          </Button>
                        ) : (
                          <span className="text-gray-500">- Tidak Ada -</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovePayment(payment)}
                            disabled={isProcessing === payment.id_pembayaran}
                            className="text-accent hover:bg-accent/5"
                          >
                            {isProcessing === payment.id_pembayaran ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Setujui
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectPayment(payment)}
                            disabled={isProcessing === payment.id_pembayaran}
                          >
                            {isProcessing === payment.id_pembayaran ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof of Payment Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
            <DialogDescription>Tampilan bukti pembayaran yang diunggah siswa.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentProofUrl ? (
              <img src={currentProofUrl} alt="Bukti Pembayaran" className="max-w-full h-auto object-contain rounded-md shadow-md" />
            ) : (
              <p className="text-center text-gray-600">Tidak ada bukti pembayaran untuk ditampilkan.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Add Fine Dialog */}
      {admin && (
        <AdminAddFineDialog
          isOpen={isAddFineDialogOpen}
          onClose={handleCloseAddFineDialog}
          onFineAdded={handleManualFineAdded}
          adminId={admin.id}
          adminUsername={admin.username}
        />
      )}
    </div>
  );
};

export default AdminFineManagement;