import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { exportToCsv, exportToExcel } from '@/utils/exportUtils'; // Import utility functions

// Interface for the data structure returned by the Supabase 'buku' select query for export
interface ExportBookItem {
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
  sinopsis: string;
  // Corrected: Supabase returns joined data as an array, even for one-to-one relationships
  kategori: { nama_kategori: string }[] | null; 
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

const AdminExportPage = () => {
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const handleExportBooks = async (formatType: 'csv' | 'excel') => {
    setLoadingBooks(true);
    try {
      const { data, error } = await supabase
        .from('buku')
        .select(`
          id_buku,
          isbn,
          penulis,
          tahun_terbit,
          judul_buku,
          kota_terbit,
          penerbit,
          no_klasifikasi,
          jumlah_buku,
          kode_rak,
          sinopsis,
          kategori (nama_kategori)
        `)
        .order('judul_buku', { ascending: true });

      if (error) {
        showError(error.message || 'Gagal mengambil data buku.');
        return;
      }

      if (data) {
        // Cast the data to the specific ExportBookItem interface
        const formattedData = (data as ExportBookItem[]).map(book => ({
          'ID Buku': book.id_buku,
          'ISBN': book.isbn,
          'Judul Buku': book.judul_buku,
          'Penulis': book.penulis,
          'Tahun Terbit': book.tahun_terbit,
          'Penerbit': book.penerbit,
          'Kota Terbit': book.kota_terbit,
          'No. Klasifikasi': book.no_klasifikasi,
          'Jumlah Buku': book.jumlah_buku,
          'Kode Rak': book.kode_rak,
          'Sinopsis': book.sinopsis,
          'Kategori': book.kategori?.[0]?.nama_kategori || 'N/A', // Access the first element of the array
        }));

        const columns = [
          'ID Buku', 'ISBN', 'Judul Buku', 'Penulis', 'Tahun Terbit', 'Penerbit',
          'Kota Terbit', 'No. Klasifikasi', 'Jumlah Buku', 'Kode Rak', 'Sinopsis', 'Kategori'
        ];

        if (formatType === 'csv') {
          exportToCsv(formattedData, 'data_buku', columns);
          showSuccess('Data buku berhasil diexport ke CSV.');
        } else {
          exportToExcel(formattedData, 'data_buku', columns);
          showSuccess('Data buku berhasil diexport ke Excel.');
        }
      }
    } catch (err) {
      console.error('Error exporting books:', err);
      showError('Terjadi kesalahan tak terduga saat export data buku.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleExportStudents = async (formatType: 'csv' | 'excel') => {
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase.rpc('get_all_siswa_for_admin');

      if (error) {
        showError(error.message || 'Gagal mengambil data siswa.');
        return;
      }

      if (data) {
        const formattedData = data.map((student: StudentItem) => ({
          'NIS': student.id_nis,
          'Nama': student.nama,
          'Kelas': student.kelas,
          'Email': student.email || '',
          'Total Pinjam': student.total_pinjam,
          'Sedang Pinjam': student.sedang_pinjam,
          'Max Peminjaman': student.max_peminjaman,
          'Total Denda': student.total_denda,
          'Status Siswa': student.status_siswa,
          'Status Peminjaman': student.status_peminjaman,
        }));

        const columns = [
          'NIS', 'Nama', 'Kelas', 'Email', 'Total Pinjam', 'Sedang Pinjam',
          'Max Peminjaman', 'Total Denda', 'Status Siswa', 'Status Peminjaman'
        ];

        if (formatType === 'csv') {
          exportToCsv(formattedData, 'data_siswa', columns);
          showSuccess('Data siswa berhasil diexport ke CSV.');
        } else {
          exportToExcel(formattedData, 'data_siswa', columns);
          showSuccess('Data siswa berhasil diexport ke Excel.');
        }
      }
    } catch (err) {
      console.error('Error exporting students:', err);
      showError('Terjadi kesalahan tak terduga saat export data siswa.');
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Export Laporan</h1>
      <p className="text-gray-600">Export data perpustakaan ke berbagai format.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Export Data Buku</CardTitle>
          <CardDescription>Unduh semua data buku dalam format CSV atau Excel.</CardDescription>
        </CardHeader>
        <CardContent className="space-x-4">
          <GSAPButton onClick={() => handleExportBooks('csv')} disabled={loadingBooks}>
            {loadingBooks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />} Export ke CSV
          </GSAPButton>
          <GSAPButton variant="outline" onClick={() => handleExportBooks('excel')} disabled={loadingBooks}>
            {loadingBooks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />} Export ke Excel
          </GSAPButton>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Export Data Siswa</CardTitle>
          <CardDescription>Unduh semua data siswa dalam format CSV atau Excel.</CardDescription>
        </CardHeader>
        <CardContent className="space-x-4">
          <GSAPButton onClick={() => handleExportStudents('csv')} disabled={loadingStudents}>
            {loadingStudents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />} Export ke CSV
          </GSAPButton>
          <GSAPButton variant="outline" onClick={() => handleExportStudents('excel')} disabled={loadingStudents}>
            {loadingStudents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />} Export ke Excel
          </GSAPButton>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportPage;