import React, { useState, useEffect, useMemo } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Search, Edit, Trash2, UserCheck, UserX, BookOpen, ChevronLeft, ChevronRight, RefreshCcw, CheckCircle, XCircle } from 'lucide-react'; // Added RefreshCcw icon
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import StudentFormDialog from '@/components/admin/StudentFormDialog';
import StudentBorrowedBooksDialog from '@/components/admin/StudentBorrowedBooksDialog'; // Import the new dialog

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

const AdminStudentManagement = () => {
  const [students, setStudents] = useState<StudentItem[]>([]); // Renamed from allStudents
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatusSiswa, setFilterStatusSiswa] = useState('all');
  const [filterBorrowingStatus, setFilterBorrowingStatus] = useState('all');

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentItem | null>(null);

  // States for the new borrowed books dialog
  const [isBorrowedBooksDialogOpen, setIsBorrowedBooksDialogOpen] = useState(false);
  const [selectedStudentNis, setSelectedStudentNis] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10); // Number of students per page
  const [totalPages, setTotalPages] = useState(1);
  const [isRecalculating, setIsRecalculating] = useState(false); // New state for recalculation loading
  const [isApproving, setIsApproving] = useState<string | null>(null); // New state to track approval loading
  const [isRejecting, setIsRejecting] = useState<string | null>(null); // New state to track rejection loading


  useEffect(() => {
    fetchStudents();
  }, [searchTerm, filterClass, filterStatusSiswa, filterBorrowingStatus, currentPage]); // Re-fetch on filter or page change

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch paginated student data
      const { data, error } = await supabase.rpc('get_paginated_siswa', {
        limit_value: studentsPerPage,
        offset_value: (currentPage - 1) * studentsPerPage,
        searchkey: searchTerm,
        filter_class: filterClass,
        filter_status_siswa: filterStatusSiswa,
        filter_borrowing_status: filterBorrowingStatus,
      });

      if (error) {
        showError(error.message || 'Gagal mengambil data siswa.');
        setStudents([]);
        setTotalPages(1);
        return;
      }
      if (data) {
        setStudents(data);
      }

      // Fetch total count for pagination
      const { data: countData, error: countError } = await supabase.rpc('get_total_siswa_count', {
        searchkey: searchTerm,
        filter_class: filterClass,
        filter_status_siswa: filterStatusSiswa,
        filter_borrowing_status: filterBorrowingStatus,
      });

      if (countError) {
        console.error('Error fetching total student count:', countError);
        setTotalPages(1);
      } else {
        setTotalPages(Math.max(1, Math.ceil((countData || 0) / studentsPerPage)));
      }

    } catch (err) {
      console.error('Error fetching students:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data siswa.');
    } finally {
      setLoading(false);
    }
  };

  // No need for filteredStudents useMemo anymore as filtering is done by RPC

  const handleDeleteStudent = async (id_nis: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus siswa "${nama}" (NIS: ${id_nis})? Ini akan menghapus semua data terkait siswa ini.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('siswa')
        .delete()
        .eq('id_nis', id_nis);

      if (error) {
        showError(error.message || 'Gagal menghapus siswa.');
        return;
      }

      showSuccess(`Siswa "${nama}" berhasil dihapus.`);
      fetchStudents(); // Refresh list
    } catch (err) {
      console.error('Error deleting student:', err);
      showError('Terjadi kesalahan tak terduga saat menghapus siswa.');
    }
  };

  const handleToggleStudentStatus = async (student: StudentItem) => {
    const newStatus = student.status_siswa === 'aktif' ? 'nonaktif' : 'aktif';
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status siswa "${student.nama}" menjadi "${newStatus}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('siswa')
        .update({ status_siswa: newStatus })
        .eq('id_nis', student.id_nis);

      if (error) {
        showError(error.message || 'Gagal mengubah status siswa.');
        return;
      }

      showSuccess(`Status siswa "${student.nama}" berhasil diubah menjadi "${newStatus}".`);
      fetchStudents(); // Refresh list
    } catch (err) {
      console.error('Error toggling student status:', err);
      showError('Terjadi kesalahan tak terduga saat mengubah status siswa.');
    }
  };

  const handleApproveStudent = async (student: StudentItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENYETUJUI akun siswa "${student.nama}" (NIS: ${student.id_nis})?`)) {
      return;
    }
    
    setIsApproving(student.id_nis);
    try {
      // Menggunakan RPC function untuk bypass RLS
      const { data, error } = await supabase.rpc('admin_approve_student_account', {
        p_id_nis: student.id_nis,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menyetujui akun siswa.');
        return;
      }

      await showSuccess(`Akun siswa "${student.nama}" berhasil disetujui!`);
      fetchStudents(); // Refresh list
    } catch (err) {
      console.error('Error approving student:', err);
      showError('Terjadi kesalahan tak terduga saat menyetujui akun siswa.');
    } finally {
      setIsApproving(null);
    }
  };

  const handleRejectStudent = async (student: StudentItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin MENOLAK akun siswa "${student.nama}" (NIS: ${student.id_nis})? Ini akan menolak permintaan pendaftaran.`)) {
      return;
    }
    
    setIsRejecting(student.id_nis);
    try {
      // Menggunakan RPC function untuk bypass RLS
      const { data, error } = await supabase.rpc('admin_reject_student_account', {
        p_id_nis: student.id_nis,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menolak akun siswa.');
        return;
      }

      await showSuccess(`Akun siswa "${student.nama}" berhasil ditolak.`);
      fetchStudents(); // Refresh list
    } catch (err) {
      console.error('Error rejecting student:', err);
      showError('Terjadi kesalahan tak terduga saat menolak akun siswa.');
    } finally {
      setIsRejecting(null);
    }
  };

  const handleAddStudent = () => {
    setStudentToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleEditStudent = (student: StudentItem) => {
    setStudentToEdit(student);
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setStudentToEdit(null);
  };

  const handleViewBorrowedBooks = (nis: string, name: string) => {
    setSelectedStudentNis(nis);
    setSelectedStudentName(name);
    setIsBorrowedBooksDialogOpen(true);
  };

  const handleCloseBorrowedBooksDialog = () => {
    setIsBorrowedBooksDialogOpen(false);
    setSelectedStudentNis(null);
    setSelectedStudentName(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleRecalculateBorrowCounts = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghitung ulang status peminjaman untuk semua siswa? Ini akan memperbaiki ketidaksesuaian data.')) {
      return;
    }
    setIsRecalculating(true);
    try {
      const { error } = await supabase.rpc('recalculate_student_borrow_counts');
      if (error) {
        showError(error.message || 'Gagal menghitung ulang status peminjaman.');
        return;
      }
      showSuccess('Status peminjaman siswa berhasil dihitung ulang!');
      fetchStudents(); // Refresh the student list to show updated counts
    } catch (err) {
      console.error('Error recalculating borrow counts:', err);
      showError('Terjadi kesalahan tak terduga saat menghitung ulang status peminjaman.');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Dummy data for classes and statuses for filters
  const classes = ['10A', '10B', '11A', '11B', '12A', '12B'];
  const statusSiswaOptions = ['aktif', 'nonaktif', 'pending', 'rejected'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Siswa</h1>
      <p className="text-gray-600">Kelola data siswa dan aktivitas peminjaman.</p>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-foreground">Daftar Siswa</CardTitle>
          <div className="flex space-x-2">
            <GSAPButton onClick={handleRecalculateBorrowCounts} size="sm" variant="outline" disabled={isRecalculating}>
              {isRecalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Hitung Ulang Status
            </GSAPButton>
            <GSAPButton onClick={handleAddStudent} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Siswa
            </GSAPButton>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama, NIS, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setFilterClass} value={filterClass}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterStatusSiswa} value={filterStatusSiswa}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status Siswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status Siswa</SelectItem>
                {statusSiswaOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterBorrowingStatus} value={filterBorrowingStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status Peminjaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status Peminjaman</SelectItem>
                <SelectItem value="sedang_meminjam">Sedang Meminjam</SelectItem>
                <SelectItem value="tidak_meminjam">Tidak Meminjam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat siswa...</p>
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada data siswa ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Dipinjam</TableHead>
                    <TableHead>Total Pinjam</TableHead>
                    <TableHead>Denda</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id_nis}>
                      <TableCell className="font-medium">{student.id_nis}</TableCell>
                      <TableCell>{student.nama}</TableCell>
                      <TableCell>{student.kelas}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>
                        {student.sedang_pinjam} / {student.max_peminjaman}
                        {student.sedang_pinjam > 0 && (
                          <GSAPButton
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-auto p-1 text-primary hover:bg-primary/5"
                            onClick={() => handleViewBorrowedBooks(student.id_nis, student.nama)}
                          >
                            <BookOpen className="h-4 w-4" />
                          </GSAPButton>
                        )}
                      </TableCell>
                      <TableCell>{student.total_pinjam}</TableCell>
                      <TableCell>Rp {student.total_denda.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          student.status_siswa === 'aktif' ? 'bg-accent/10 text-accent' : 
                          student.status_siswa === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          student.status_siswa === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status_siswa}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {student.status_siswa === 'pending' ? (
                          <div className="flex justify-end space-x-2">
                            <GSAPButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveStudent(student)}
                              disabled={isApproving === student.id_nis}
                              className="text-accent hover:bg-accent/5"
                            >
                              {isApproving === student.id_nis ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Setujui
                            </GSAPButton>
                            <GSAPButton
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectStudent(student)}
                              disabled={isRejecting === student.id_nis}
                            >
                              {isRejecting === student.id_nis ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Tolak
                            </GSAPButton>
                          </div>
                        ) : (
                          <>
                            <GSAPButton variant="ghost" size="sm" className="mr-2" onClick={() => handleEditStudent(student)}>
                              <Edit className="h-4 w-4" />
                            </GSAPButton>
                            <GSAPButton
                              variant="ghost"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleToggleStudentStatus(student)}
                            >
                              {student.status_siswa === 'aktif' ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-accent" />
                              )}
                            </GSAPButton>
                            <GSAPButton variant="destructive" size="sm" onClick={() => handleDeleteStudent(student.id_nis, student.nama)}>
                              <Trash2 className="h-4 w-4" />
                            </GSAPButton>
                          </>
                        )}
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

      <StudentFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={fetchStudents}
        studentToEdit={studentToEdit}
      />

      <StudentBorrowedBooksDialog
        isOpen={isBorrowedBooksDialogOpen}
        onClose={handleCloseBorrowedBooksDialog}
        studentNis={selectedStudentNis}
        studentName={selectedStudentName}
      />
    </div>
  );
};

export default AdminStudentManagement;