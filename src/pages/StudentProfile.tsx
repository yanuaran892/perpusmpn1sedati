import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Loader2, LogOut, ArrowLeft, RefreshCcw } from 'lucide-react'; // Import RefreshCcw
import FinePaymentRequestDialog from '@/components/FinePaymentRequestDialog';
import StudentProfileInfo from '@/components/student/StudentProfileInfo';
import StudentChangePasswordForm from '@/components/student/StudentChangePasswordForm';
import StudentFineHistory from '@/components/student/StudentFineHistory';
import StudentCirculationHistory from '@/components/student/StudentCirculationHistory';

const StudentProfile = () => {
  const { student, isLoading: authLoading, logout, fetchStudentProfile } = useStudentAuth();
  const navigate = useNavigate();

  const [isFinePaymentDialogOpen, setIsFinePaymentDialogOpen] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false); // New state for refresh loading

  const refreshFineHistory = useCallback(() => {
    // This empty function is passed down. The actual fetch logic is inside StudentFineHistory.
    // By passing a new reference, it triggers useEffect in child.
  }, []);

  const refreshCirculationHistory = useCallback(() => {
    // Similar to refreshFineHistory
  }, []);

  const handleRefreshStudentProfile = useCallback(async () => {
    if (student?.id_nis) {
      setIsRefreshingProfile(true); // Start loading
      await fetchStudentProfile(student.id_nis);
      setIsRefreshingProfile(false); // End loading
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
      <div className="max-w-full lg:max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <GSAPButton 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            size="icon" // Default to icon size
            className="text-primary hover:bg-primary/5 transition-colors duration-200 md:w-auto md:px-4 md:py-2" // Adjust for larger screens
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden md:inline ml-2">Kembali ke Dashboard</span>
          </GSAPButton>
          <div className="flex space-x-2">
            <GSAPButton 
              onClick={handleRefreshStudentProfile} 
              variant="outline" 
              size="icon" // Default to icon size
              className="text-gray-600 hover:bg-gray-100 transition-colors duration-200 md:w-auto md:px-4 md:py-2" // Adjust for larger screens
              disabled={isRefreshingProfile}
            >
              {isRefreshingProfile ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCcw className="h-5 w-5" />
              )}
              <span className="hidden md:inline ml-2">Refresh Data</span>
            </GSAPButton>
            <GSAPButton 
              onClick={handleLogout} 
              variant="ghost" 
              size="icon" // Default to icon size
              className="text-red-600 hover:bg-red-50 transition-colors duration-200 md:w-auto md:px-4 md:py-2" // Adjust for larger screens
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline ml-2">Logout</span>
            </GSAPButton>
          </div>
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