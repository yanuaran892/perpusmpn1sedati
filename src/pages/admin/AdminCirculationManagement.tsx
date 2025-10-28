import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, CheckCircle, XCircle, RotateCcw, Clock, ChevronLeft, ChevronRight } from 'lucide-react'; // Added Clock icon
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale for formatting

// Updated interface to match the RPC output (timestamp with time zone)
interface CirculationItem {
  id_sirkulasi: number;
  id_nis: string;
  id_buku: number;
  tanggal_pinjam: string; // Changed to string to handle timestamp with time zone
  tanggal_kembali: string; // Changed to string to handle timestamp with time zone
  tanggal_dikembalikan: string | null; // Changed to string to handle timestamp with time zone
  status: string;
  denda: number;
  judul_buku: string | null; // Directly from RPC
  siswa_nama: string | null; // Directly from RPC
  siswa_kelas: string | null; // Directly from RPC
  jumlah_perpanjangan: number; // New field
  tanggal_kembali_request: string | null; // New field for extension requests
}

const AdminCirculationManagement = () => {
  const [circulation, setCirculation] = useState<CirculationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isProcessingReturn, setIsProcessingReturn] = useState<number | null>(null); // State for loading during return approval/rejection
  const [isProcessingBorrowRequest, setIsProcessingBorrowRequest] = useState<number | null>(null); // State for loading during borrow request approval/rejection
  const [isProcessingExtension, setIsProcessingExtension] = useState<number | null>(null); // New state for loading during extension approval/rejection

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCirculation();
  }, [searchTerm, filterStatus, currentPage]); // Re-fetch on search term, filter status, or page change

  const fetchCirculation = async () => {
    setLoading(true);
    try {
      // Use the new RPC function for paginated and filtered data
      const { data, error } = await supabase.rpc('get_paginated_admin_circulation_data', {
        limit_value: itemsPerPage,
        offset_value: (currentPage - 1) * itemsPerPage,
        searchkey: searchTerm,
        filter_status: filterStatus,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil data sirkulasi.');
        setCirculation([]);
        setTotalPages(1);
        return;
      }
      if (data) {
        setCirculation(data as CirculationItem[]);
      }

      // Fetch total count for pagination
      const { data: countData, error: countError } = await supabase.rpc('get_total_admin_circulation_count', {
        searchkey: searchTerm,
        filter_status: filterStatus,
      });

      if (countError) {
        console.error('Error fetching total circulation count:', countError);
        setTotalPages(1);
      } else {
        setTotalPages(Math.max(1, Math.ceil((countData || 0) / itemsPerPage)));
      }

    } catch (err) {
      console.error('Error fetching circulation:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data sirkulasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI pengembalian buku "${item.judul_buku}" oleh "${item.siswa_nama}"?`)) {
      return;
    }

    setIsProcessingReturn(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('approve_return_request_admin', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menyetujui pengembalian buku.');
        return;
      }

      showSuccess(`Pengembalian buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil disetujui!`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error approving return request:', err);
      showError('Terjadi kesalahan saat menyetujui pengembalian buku.');
    } finally {
      setIsProcessingReturn(null);
    }
  };

  const handleRejectReturn = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENOLAK pengembalian buku "${item.judul_buku}" oleh "${item.siswa_nama}"? Status akan dikembalikan menjadi 'dipinjam'.`)) {
      return;
    }

    setIsProcessingReturn(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('reject_return_request_admin', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menolak pengembalian buku.');
        return;
      }

      showSuccess(`Pengembalian buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil ditolak. Status dikembalikan menjadi 'dipinjam'.`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error rejecting return request:', err);
      showError('Terjadi kesalahan saat menolak pengembalian buku.');
    } finally {
      setIsProcessingReturn(null);
    }
  };

  const handleApproveBorrow = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI permintaan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}"?`)) {
      return;
    }

    setIsProcessingBorrowRequest(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('approve_borrow_request', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menyetujui permintaan peminjaman.');
        return;
      }

      showSuccess(`Permintaan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil disetujui!`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error approving borrow request:', err);
      showError('Terjadi kesalahan saat menyetujui permintaan peminjaman.');
    } finally {
      setIsProcessingBorrowRequest(null);
    }
  };

  const handleRejectBorrow = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENOLAK permintaan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}"?`)) {
      return;
    }

    setIsProcessingBorrowRequest(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('reject_borrow_request', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menolak permintaan peminjaman.');
        return;
      }

      showSuccess(`Permintaan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil ditolak.`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error rejecting borrow request:', err);
      showError('Terjadi kesalahan saat menolak permintaan peminjaman.');
    } finally {
      setIsProcessingBorrowRequest(null);
    }
  };

  const handleApproveExtension = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI perpanjangan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}" hingga ${format(new Date(item.tanggal_kembali_request!), 'dd MMM yyyy HH:mm', { locale: id })}?`)) {
      return;
    }

    setIsProcessingExtension(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('approve_extension_request_admin', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menyetujui perpanjangan peminjaman.');
        return;
      }

      showSuccess(`Perpanjangan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil disetujui!`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error approving extension request:', err);
      showError('Terjadi kesalahan saat menyetujui perpanjangan peminjaman.');
    } finally {
      setIsProcessingExtension(null);
    }
  };

  const handleRejectExtension = async (item: CirculationItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENOLAK perpanjangan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}"? Status akan dikembalikan menjadi 'dipinjam'.`)) {
      return;
    }

    setIsProcessingExtension(item.id_sirkulasi);
    try {
      const { data, error } = await supabase.rpc('reject_extension_request_admin', {
        p_sirkulasi_id: item.id_sirkulasi,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menolak perpanjangan peminjaman.');
        return;
      }

      showSuccess(`Perpanjangan peminjaman buku "${item.judul_buku}" oleh "${item.siswa_nama}" berhasil ditolak. Status dikembalikan menjadi 'dipinjam'.`);
      fetchCirculation(); // Refresh list
    } catch (err) {
      console.error('Error rejecting extension request:', err);
      showError('Terjadi kesalahan saat menolak perpanjangan peminjaman.');
    } finally {
      setIsProcessingExtension(null);
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
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Sirkulasi</h1>
      <p className="text-gray-600">Kelola peminjaman dan pengembalian buku.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Daftar Sirkulasi</CardTitle>
          <CardDescription>Pantau status peminjaman buku.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari buku, siswa, atau NIS..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
            <Select onValueChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1); // Reset to first page on filter change
            }} value={filterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Peminjaman</SelectItem>
                <SelectItem value="dipinjam">Dipinjam</SelectItem>
                <SelectItem value="return_pending">Menunggu Pengembalian</SelectItem>
                <SelectItem value="extension_pending">Menunggu Perpanjangan</SelectItem> {/* New status */}
                <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat sirkulasi...</p>
            </div>
          ) : circulation.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada data sirkulasi ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Pinjam</TableHead>
                    <TableHead>Kembali (Est.)</TableHead>
                    <TableHead>Dikembalikan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Perpanjangan</TableHead>
                    <TableHead className="text-right">Denda</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circulation.map((item) => (
                    <TableRow key={item.id_sirkulasi}>
                      <TableCell className="font-medium">{item.judul_buku || 'N/A'}</TableCell>
                      <TableCell>{item.siswa_nama || 'N/A'}</TableCell>
                      <TableCell>{item.id_nis}</TableCell>
                      <TableCell>{item.siswa_kelas || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(item.tanggal_pinjam), 'dd MMM yyyy HH:mm', { locale: id })}</TableCell>
                      <TableCell>
                        {item.status === 'extension_pending' && item.tanggal_kembali_request ? (
                          <div className="flex flex-col">
                            <span className="line-through text-gray-500">{format(new Date(item.tanggal_kembali), 'dd MMM yyyy HH:mm', { locale: id })}</span>
                            <span className="font-semibold text-blue-600">{format(new Date(item.tanggal_kembali_request), 'dd MMM yyyy HH:mm', { locale: id })} (Req)</span>
                          </div>
                        ) : (
                          format(new Date(item.tanggal_kembali), 'dd MMM yyyy HH:mm', { locale: id })
                        )}
                      </TableCell>
                      <TableCell>{item.tanggal_dikembalikan ? format(new Date(item.tanggal_dikembalikan), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'dipinjam' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'dikembalikan' ? 'bg-accent/10 text-accent' :
                          item.status === 'pending' ? 'bg-primary/10 text-primary' :
                          item.status === 'return_pending' ? 'bg-purple-100 text-purple-800' :
                          item.status === 'extension_pending' ? 'bg-blue-100 text-blue-800' : // Style for extension_pending
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'pending' ? 'Menunggu Peminjaman' : 
                           item.status === 'return_pending' ? 'Menunggu Pengembalian' : 
                           item.status === 'extension_pending' ? 'Menunggu Perpanjangan' : // Display for extension_pending
                           item.status === 'rejected' ? 'Ditolak' : item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.jumlah_perpanjangan} / 3</TableCell>
                      <TableCell className="text-right">Rp {item.denda.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        {item.status === 'pending' ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveBorrow(item)}
                              disabled={isProcessingBorrowRequest === item.id_sirkulasi}
                              className="text-accent hover:bg-accent/5"
                            >
                              {isProcessingBorrowRequest === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Setujui
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectBorrow(item)}
                              disabled={isProcessingBorrowRequest === item.id_sirkulasi}
                            >
                              {isProcessingBorrowRequest === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Tolak
                            </Button>
                          </div>
                        ) : item.status === 'return_pending' ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveReturn(item)}
                              disabled={isProcessingReturn === item.id_sirkulasi}
                              className="text-accent hover:bg-accent/5"
                            >
                              {isProcessingReturn === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Setujui Pengembalian
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectReturn(item)}
                              disabled={isProcessingReturn === item.id_sirkulasi}
                            >
                              {isProcessingReturn === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Tolak Pengembalian
                            </Button>
                          </div>
                        ) : item.status === 'extension_pending' ? ( // New condition for extension_pending
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveExtension(item)}
                              disabled={isProcessingExtension === item.id_sirkulasi}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              {isProcessingExtension === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Setujui Perpanjangan
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectExtension(item)}
                              disabled={isProcessingExtension === item.id_sirkulasi}
                            >
                              {isProcessingExtension === item.id_sirkulasi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Tolak Perpanjangan
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCirculationManagement;