import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

interface CirculationItem {
  id_sirkulasi: number;
  id_nis: string;
  id_buku: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  tanggal_dikembalikan: string | null;
  status: string;
  denda: number;
  judul_buku?: string;
}

interface StudentCirculationHistoryProps {
  studentNis: string;
  onRefreshCirculationHistory: () => void;
  onRefreshStudentProfile: (nis: string) => void;
}

const StudentCirculationHistory: React.FC<StudentCirculationHistoryProps> = ({
  studentNis,
  onRefreshCirculationHistory,
  onRefreshStudentProfile,
}) => {
  const [circulationHistory, setCirculationHistory] = useState<CirculationItem[]>([]);
  const [loadingCirculation, setLoadingCirculation] = useState(true);
  const [isRequestingReturn, setIsRequestingReturn] = useState<number | null>(null);

  useEffect(() => {
    if (studentNis) {
      fetchCirculationHistory();
    }
  }, [studentNis, onRefreshCirculationHistory]);

  const fetchCirculationHistory = async () => {
    if (!studentNis) return;
    setLoadingCirculation(true);
    try {
      const { data, error } = await supabase.rpc('get_student_circulation_history', {
        p_id_nis: studentNis,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil riwayat sirkulasi.');
        setCirculationHistory([]);
        return;
      }

      if (data) {
        setCirculationHistory(data as CirculationItem[]);
      }
    } catch (err) {
      console.error('Error fetching circulation history:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil riwayat sirkulasi.');
    } finally {
      setLoadingCirculation(false);
    }
  };

  const handleRequestReturnBook = async (sirkulasiId: number, bookTitle: string) => {
    if (!studentNis) {
      showError('Anda harus login untuk mengajukan pengembalian buku.');
      return;
    }

    setIsRequestingReturn(sirkulasiId);
    try {
      const { data, error } = await supabase.rpc('request_return_book', {
        p_sirkulasi_id: sirkulasiId,
        p_id_nis: studentNis,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal mengajukan permintaan pengembalian buku.');
        return;
      }

      showSuccess(`Permintaan pengembalian buku "${bookTitle}" berhasil diajukan! Menunggu persetujuan admin.`);
      onRefreshCirculationHistory();
      onRefreshStudentProfile(studentNis);
    } catch (err) {
      console.error('Error requesting return book:', err);
      showError('Terjadi kesalahan saat mengajukan permintaan pengembalian buku.');
    } finally {
      setIsRequestingReturn(null);
    }
  };

  return (
    <Card className="shadow-xl border-t-4 border-purple-500">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Riwayat Sirkulasi Buku</CardTitle>
        <CardDescription className="text-gray-600">Daftar buku yang pernah Anda pinjam.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingCirculation ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-lg text-gray-700">Memuat riwayat sirkulasi...</p>
          </div>
        ) : circulationHistory.length === 0 ? (
          <p className="text-center text-gray-600 py-4 text-base">Belum ada riwayat peminjaman.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Judul Buku</TableHead>
                  <TableHead className="text-sm">Tanggal Pinjam</TableHead>
                  <TableHead className="text-sm">Tanggal Kembali</TableHead>
                  <TableHead className="text-sm">Dikembalikan</TableHead>
                  <TableHead className="text-sm">Status</TableHead>
                  <TableHead className="text-right text-sm">Denda</TableHead>
                  <TableHead className="text-right text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circulationHistory.map((item) => (
                  <TableRow key={item.id_sirkulasi}>
                    <TableCell className="font-medium text-sm">{item.judul_buku}</TableCell>
                    <TableCell className="text-sm">{format(new Date(item.tanggal_pinjam), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-sm">{format(new Date(item.tanggal_kembali), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-sm">{item.tanggal_dikembalikan ? format(new Date(item.tanggal_dikembalikan), 'dd MMM yyyy') : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'dipinjam' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'dikembalikan' ? 'bg-accent/10 text-accent' :
                        item.status === 'return_pending' ? 'bg-primary/10 text-primary' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'return_pending' ? 'Menunggu Persetujuan' : item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">Rp {item.denda.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      {item.status === 'dipinjam' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestReturnBook(item.id_sirkulasi, item.judul_buku || 'Buku')}
                          disabled={isRequestingReturn === item.id_sirkulasi}
                          className="text-primary hover:bg-primary/5"
                        >
                          {isRequestingReturn === item.id_sirkulasi ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-1" />
                          )}
                          Ajukan Pengembalian
                        </Button>
                      )}
                      {item.status === 'return_pending' && (
                        <span className="text-sm text-gray-500">Menunggu Persetujuan</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCirculationHistory;