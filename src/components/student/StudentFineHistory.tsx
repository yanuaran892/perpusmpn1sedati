import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GSAPButton from '@/components/GSAPButton';
import { Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'; // Import ChevronLeft, ChevronRight
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FinePaymentHistoryItem {
  id_pembayaran: number;
  jumlah_bayar: number;
  tanggal_bayar: string;
  status_pembayaran: string;
  bukti_pembayaran_url: string | null;
  created_at: string;
}

interface StudentFineHistoryProps {
  studentNis: string;
  onRefreshFineHistory: () => void;
}

const StudentFineHistory: React.FC<StudentFineHistoryProps> = ({ studentNis, onRefreshFineHistory }) => {
  const [finePaymentHistory, setFinePaymentHistory] = useState<FinePaymentHistoryItem[]>([]);
  const [loadingFineHistory, setLoadingFineHistory] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (studentNis) {
      fetchFinePaymentHistory();
    }
  }, [studentNis, onRefreshFineHistory, currentPage]); // Re-fetch on page change

  const fetchFinePaymentHistory = async () => {
    if (!studentNis) return;
    setLoadingFineHistory(true);
    try {
      // Fetch paginated fine payment data
      const { data, error } = await supabase.rpc('get_paginated_student_fine_payments', {
        p_id_nis: studentNis,
        limit_value: itemsPerPage,
        offset_value: (currentPage - 1) * itemsPerPage,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil riwayat pembayaran denda.');
        setFinePaymentHistory([]);
        setTotalPages(1);
        return;
      }

      if (data) {
        setFinePaymentHistory(data as FinePaymentHistoryItem[]);
      }

      // Fetch total count for pagination
      const { data: countData, error: countError } = await supabase.rpc('get_total_student_fine_payments_count', {
        p_id_nis: studentNis,
      });

      if (countError) {
        console.error('Error fetching total fine payments count:', countError);
        setTotalPages(1);
      } else {
        setTotalPages(Math.max(1, Math.ceil((countData || 0) / itemsPerPage)));
      }

    } catch (err) {
      console.error('Error fetching fine payment history:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil riwayat pembayaran denda.');
    } finally {
      setLoadingFineHistory(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <>
      <Card className="shadow-xl border-t-4 border-yellow-500 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Riwayat Pembayaran Denda</CardTitle>
          <CardDescription className="text-gray-600">Daftar riwayat pembayaran denda Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFineHistory ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-lg text-gray-700">Memuat riwayat pembayaran denda...</p>
            </div>
          ) : finePaymentHistory.length === 0 ? (
            <p className="text-center text-gray-600 py-4 text-base">Belum ada riwayat pembayaran denda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm">ID Pembayaran</TableHead>
                    <TableHead className="text-sm">Jumlah Bayar</TableHead>
                    <TableHead className="text-sm">Tanggal Permintaan</TableHead>
                    <TableHead className="text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finePaymentHistory.map((item) => (
                    <TableRow key={item.id_pembayaran}>
                      <TableCell className="font-medium text-sm">{item.id_pembayaran}</TableCell>
                      <TableCell className="text-sm">Rp {item.jumlah_bayar.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-sm">{format(new Date(item.created_at), 'dd MMM yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status_pembayaran === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status_pembayaran === 'approved' ? 'bg-accent/10 text-accent' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status_pembayaran}
                        </span>
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
                  disabled={currentPage === 1 || loadingFineHistory}
                >
                  <ChevronLeft className="h-4 w-4" />
                </GSAPButton>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <GSAPButton
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loadingFineHistory}
                >
                  <ChevronRight className="h-4 w-4" />
                </GSAPButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default StudentFineHistory;