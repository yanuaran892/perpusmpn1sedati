import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
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
  // const [isProofDialogOpen, setIsProofDialogOpen] = useState(false); // Removed
  // const [currentProofUrl, setCurrentProofUrl] = useState<string | null>(null); // Removed

  useEffect(() => {
    if (studentNis) {
      fetchFinePaymentHistory();
    }
  }, [studentNis, onRefreshFineHistory]);

  const fetchFinePaymentHistory = async () => {
    if (!studentNis) return;
    setLoadingFineHistory(true);
    try {
      const { data, error } = await supabase.rpc('get_student_fine_payments', {
        p_id_nis: studentNis,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil riwayat pembayaran denda.');
        setFinePaymentHistory([]);
        return;
      }

      if (data) {
        setFinePaymentHistory(data as FinePaymentHistoryItem[]);
      }
    } catch (err) {
      console.error('Error fetching fine payment history:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil riwayat pembayaran denda.');
    } finally {
      setLoadingFineHistory(false);
    }
  };

  // const handleViewProof = (url: string | null) => { // Removed
  //   if (url) {
  //     setCurrentProofUrl(url);
  //     setIsProofDialogOpen(true);
  //   } else {
  //     showError('Tidak ada bukti pembayaran yang diunggah.');
  //   }
  // };

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm">ID Pembayaran</TableHead>
                    <TableHead className="text-sm">Jumlah Bayar</TableHead>
                    <TableHead className="text-sm">Tanggal Permintaan</TableHead>
                    <TableHead className="text-sm">Status</TableHead>
                    {/* <TableHead className="text-right text-sm">Bukti</TableHead> */} {/* Removed */}
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
                      {/* <TableCell className="text-right"> */} {/* Removed */}
                        {/* {item.bukti_pembayaran_url ? ( */} {/* Removed */}
                          {/* <Button variant="outline" size="sm" onClick={() => handleViewProof(item.bukti_pembayaran_url)}> */} {/* Removed */}
                            {/* <Eye className="h-4 w-4" /> */} {/* Removed */}
                          {/* </Button> */} {/* Removed */}
                        {/* ) : ( */} {/* Removed */}
                          {/* <span className="text-gray-500 text-sm">-</span> */} {/* Removed */}
                        {/* )} */} {/* Removed */}
                      {/* </TableCell> */} {/* Removed */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proof of Payment Dialog for Student */}
      {/* <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}> */} {/* Removed */}
        {/* <DialogContent className="sm:max-w-[600px]"> */} {/* Removed */}
          {/* <DialogHeader> */} {/* Removed */}
            {/* <DialogTitle className="text-2xl font-bold text-primary">Bukti Pembayaran</DialogTitle> */} {/* Removed */}
            {/* <DialogDescription className="text-gray-600">Tampilan bukti pembayaran yang Anda unggah.</DialogDescription> */} {/* Removed */}
          {/* </DialogHeader> */} {/* Removed */}
          {/* <div className="py-4"> */} {/* Removed */}
            {/* {currentProofUrl ? ( */} {/* Removed */}
              {/* <img src={currentProofUrl} alt="Bukti Pembayaran" className="max-w-full h-auto object-contain rounded-md shadow-md" /> */} {/* Removed */}
            {/* ) : ( */} {/* Removed */}
              {/* <p className="text-center text-gray-600 text-base">Tidak ada bukti pembayaran untuk ditampilkan.</p> */} {/* Removed */}
            {/* )} */} {/* Removed */}
          {/* </div> */} {/* Removed */}
        {/* </DialogContent> */} {/* Removed */}
      {/* </Dialog> */} {/* Removed */}
    </>
  );
};

export default StudentFineHistory;