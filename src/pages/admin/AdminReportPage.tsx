import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Download, FileText, Loader2, CalendarIcon, Eye } from 'lucide-react'; // Added Eye icon
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { exportToWord } from '@/utils/exportUtils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import ReportPreviewDialog from '@/components/admin/ReportPreviewDialog'; // Import the new dialog

// Interface for the detailed circulation item returned by RPC
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

// Interface for the formatted report data
interface CirculationReportItem {
  'ID Sirkulasi': number;
  'NIS Siswa': string;
  'Nama Siswa': string;
  'Judul Buku': string;
  'Tanggal Pinjam': string;
  'Tanggal Kembali (Estimasi)': string;
  'Tanggal Dikembalikan': string;
  'Status': string;
  'Denda (Rp)': string;
}

const AdminReportPage = () => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // State for Report Preview Dialog
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewReportData, setPreviewReportData] = useState<CirculationReportItem[]>([]);
  const [previewReportColumns, setPreviewReportColumns] = useState<string[]>([]);
  const [previewReportTitle, setPreviewReportTitle] = useState('');
  const [previewReportDescription, setPreviewReportDescription] = useState('');

  const generateCirculationReportData = async (): Promise<CirculationReportItem[] | null> => {
    setLoadingReport(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_circulation_data');

      if (error) {
        showError(error.message || 'Gagal mengambil data sirkulasi.');
        return null;
      }

      if (data) {
        const filteredData = (data as AdminCirculationItem[]).filter(item => {
          const itemDate = new Date(item.tanggal_pinjam);
          const start = startDate ? startOfDay(startDate) : null;
          const end = endDate ? endOfDay(endDate) : null;

          return (!start || !isBefore(itemDate, start)) && (!end || !isAfter(itemDate, end));
        });

        if (filteredData.length === 0) {
          showError('Tidak ada data sirkulasi untuk rentang tanggal yang dipilih.');
          return [];
        }

        const formattedData: CirculationReportItem[] = filteredData.map(item => ({
          'ID Sirkulasi': item.id_sirkulasi,
          'NIS Siswa': item.id_nis,
          'Nama Siswa': item.siswa_nama || 'N/A',
          'Judul Buku': item.judul_buku || 'N/A',
          'Tanggal Pinjam': format(new Date(item.tanggal_pinjam), 'dd MMMM yyyy', { locale: id }),
          'Tanggal Kembali (Estimasi)': format(new Date(item.tanggal_kembali), 'dd MMMM yyyy', { locale: id }),
          'Tanggal Dikembalikan': item.tanggal_dikembalikan ? format(new Date(item.tanggal_dikembalikan), 'dd MMMM yyyy', { locale: id }) : '-',
          'Status': item.status,
          'Denda (Rp)': item.denda.toLocaleString('id-ID'),
        }));
        return formattedData;
      }
      return null;
    } catch (err) {
      console.error('Error generating circulation report data:', err);
      showError('Terjadi kesalahan tak terduga saat menghasilkan data laporan peminjaman.');
      return null;
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePreviewCirculationReport = async () => {
    const data = await generateCirculationReportData();
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      const dateRangeString = (startDate && endDate) ?
        `${format(startDate, 'dd-MM-yyyy')} sampai ${format(endDate, 'dd-MM-yyyy')}` :
        'Semua Waktu';

      setPreviewReportData(data);
      setPreviewReportColumns(columns);
      setPreviewReportTitle('Laporan Peminjaman Buku');
      setPreviewReportDescription(`Laporan detail aktivitas peminjaman buku untuk rentang tanggal: ${dateRangeString}.`);
      setIsPreviewDialogOpen(true);
    }
  };

  const handleDownloadCirculationReport = () => {
    if (previewReportData.length > 0) {
      const dateRangeString = (startDate && endDate) ?
        `${format(startDate, 'dd-MM-yyyy')} sampai ${format(endDate, 'dd-MM-yyyy')}` :
        'Semua Waktu';
      exportToWord(previewReportData, `Peminjaman (${dateRangeString})`, previewReportColumns);
      showSuccess('Laporan peminjaman berhasil diunduh sebagai Word.');
      setIsPreviewDialogOpen(false); // Close dialog after download
    } else {
      showError('Tidak ada data untuk diunduh.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
      <p className="text-gray-600">Hasilkan berbagai laporan untuk analisis data perpustakaan.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Laporan Peminjaman</CardTitle>
          <CardDescription>Hasilkan laporan detail tentang aktivitas peminjaman buku.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Pilih rentang tanggal untuk laporan peminjaman:</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <GSAPButton
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: id }) : <span>Tanggal Mulai</span>}
                </GSAPButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <span className="text-gray-500">hingga</span>
            <Popover>
              <PopoverTrigger asChild>
                <GSAPButton
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: id }) : <span>Tanggal Akhir</span>}
                </GSAPButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-4">
            <GSAPButton onClick={handlePreviewCirculationReport} disabled={loadingReport}>
              {loadingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat Preview...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Preview Laporan
                </>
              )}
            </GSAPButton>
            {/* The download button is now inside the preview dialog */}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Laporan Pengunjung</CardTitle>
          <CardDescription>Lihat statistik kunjungan perpustakaan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">Analisis tren pengunjung harian, mingguan, atau bulanan.</p>
          <GSAPButton>
            <Download className="mr-2 h-4 w-4" /> Unduh Laporan Pengunjung
          </GSAPButton>
        </CardContent>
      </Card>

      <ReportPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        reportTitle={previewReportTitle}
        reportDescription={previewReportDescription}
        columns={previewReportColumns}
        data={previewReportData}
        onDownload={handleDownloadCirculationReport}
        isDownloading={loadingReport} // Use loadingReport for download state as well
      />
    </div>
  );
};

export default AdminReportPage;