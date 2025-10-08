import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, ArrowLeft } from 'lucide-react';
import FinePaymentRequestDialog from '@/components/FinePaymentRequestDialog';
import StudentProfileInfo from '@/components/student/StudentProfileInfo';
import StudentChangePasswordForm from '@/components/student/StudentChangePasswordForm';
import StudentFineHistory from '@/components/student/StudentFineHistory';
import StudentCirculationHistory from '@/components/student/StudentCirculationHistory';

const StudentProfile = () => {
  const { student, isLoading: authLoading, logout, fetchStudentProfile } = useStudentAuth();
  const navigate = useNavigate();

  const [isFinePaymentDialogOpen, setIsFinePaymentDialogOpen] = useState(false);

  const refreshFineHistory = useCallback(() => {
    // This empty function is passed down. The actual fetch logic is inside StudentFineHistory.
    // By passing a new reference, it triggers useEffect in child.
  }, []);

  const refreshCirculationHistory = useCallback(() => {
    // Similar to refreshFineHistory
  }, []);

  const handleRefreshStudentProfile = useCallback(() => {
    if (student?.id_nis) {
      fetchStudentProfile(student.id_nis);
    }
  }, [student?.id_nis, fetchStudentProfile]);


  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/login');
    } 
    // Menghapus panggilan fetchStudentProfile yang berulang di sini.
    // Data siswa seharusnya sudah dimuat oleh StudentAuthContext saat login atau dari localStorage.
    // Pembaruan eksplisit ditangani oleh handleRefreshStudentProfile.
  }, [student, authLoading, navigate]); // Dependensi disederhanakan

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenFinePaymentDialog = () => {
    setIsFinePaymentDialogOpen(true);
  };

  const handleCloseFinePaymentDialog = () => {
    setIsFinePaymentDialogOpen(false);
  };

  const handlePaymentRequested = () => {
    refreshFineHistory();
    handleRefreshStudentProfile();
  };

  if (authLoading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-700">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-primary hover:bg-primary/5 transition-colors duration-200">
            <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Dashboard
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="text-red-600 hover:bg-red-50 transition-colors duration-200">
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </div>

        <h1 className="text-4xl font-extrabold text-center text-foreground mb-10 animate-fade-in-up">
          Profil Siswa
        </h1>

        <div className="space-y-8">
          <StudentProfileInfo
            student={student}
            onOpenFinePaymentDialog={handleOpenFinePaymentDialog}
          />

          <StudentChangePasswordForm
            studentNis={student.id_nis}
          />

          <StudentFineHistory
            studentNis={student.id_nis}
            onRefreshFineHistory={refreshFineHistory}
          />

          <StudentCirculationHistory
            studentNis={student.id_nis}
            onRefreshCirculationHistory={refreshCirculationHistory}
            onRefreshStudentProfile={handleRefreshStudentProfile}
          />
        </div>
      </div>

      <FinePaymentRequestDialog
        isOpen={isFinePaymentDialogOpen}
        onClose={handleCloseFinePaymentDialog}
        onPaymentRequested={handlePaymentRequested}
        currentTotalDenda={student.total_denda}
      />
    </div>
  );
};

export default StudentProfile;