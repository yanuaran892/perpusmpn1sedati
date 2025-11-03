import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import GSAPButton from '@/components/GSAPButton';
import { Loader2, LogOut, ArrowLeft, RefreshCcw, User, BookOpen, DollarSign, Key, History } from 'lucide-react';
import FinePaymentRequestDialog from '@/components/FinePaymentRequestDialog';
import StudentProfileInfo from '@/components/student/StudentProfileInfo';
import StudentChangePasswordForm from '@/components/student/StudentChangePasswordForm';
import StudentFineHistory from '@/components/student/StudentFineHistory';
import StudentCirculationHistory from '@/components/student/StudentCirculationHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StudentProfile = () => {
  const { student, isLoading: authLoading, logout, fetchStudentProfile } = useStudentAuth();
  const navigate = useNavigate();

  const [isFinePaymentDialogOpen, setIsFinePaymentDialogOpen] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const refreshFineHistory = useCallback(() => {
    // This empty function is passed down. The actual fetch logic is inside StudentFineHistory.
    // By passing a new reference, it triggers useEffect in child.
  }, []);

  const refreshCirculationHistory = useCallback(() => {
    // Similar to refreshFineHistory
  }, []);

  const handleRefreshStudentProfile = useCallback(async () => {
    if (student?.id_nis) {
      setIsRefreshingProfile(true);
      await fetchStudentProfile(student.id_nis);
      setIsRefreshingProfile(false);
    }
  }, [student?.id_nis, fetchStudentProfile]);

  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/login');
    }
  }, [student, authLoading, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-2xl text-gray-700 font-medium">Memuat Profil...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Ubah Password', icon: Key },
    { id: 'fines', label: 'Riwayat Denda', icon: DollarSign },
    { id: 'history', label: 'Riwayat Peminjaman', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <div className="flex items-center">
            <GSAPButton 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="mr-4 text-primary hover:bg-primary/5 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </GSAPButton>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Profil Siswa</h1>
              <p className="text-gray-600">Kelola informasi dan aktivitas perpustakaan Anda</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-3 shadow-md">
              <p className="text-sm text-gray-600">Selamat datang,</p>
              <p className="font-semibold text-gray-900">{student.nama}</p>
            </div>
            <GSAPButton 
              onClick={handleRefreshStudentProfile} 
              variant="outline" 
              className="text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              disabled={isRefreshingProfile}
            >
              {isRefreshingProfile ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCcw className="h-5 w-5" />
              )}
            </GSAPButton>
            <GSAPButton 
              onClick={handleLogout} 
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <LogOut className="h-5 w-5" />
            </GSAPButton>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-1 bg-white/20">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{student.nama}</h2>
                    <p className="text-blue-100 text-lg mb-4">{student.kelas} • NIS: {student.id_nis}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[120px]">
                        <p className="text-sm text-blue-100">Buku Dipinjam</p>
                        <p className="text-xl font-bold">{student.sedang_pinjam}/{student.max_peminjaman}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[120px]">
                        <p className="text-sm text-blue-100">Total Pinjam</p>
                        <p className="text-xl font-bold">{student.total_pinjam}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[120px]">
                        <p className="text-sm text-blue-100">Total Denda</p>
                        <p className="text-xl font-bold">Rp {student.total_denda.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-lg p-2 rounded-2xl shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <GSAPButton
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </GSAPButton>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6"
            >
              {activeTab === 'profile' && (
                <StudentProfileInfo
                  student={student}
                  onOpenFinePaymentDialog={handleOpenFinePaymentDialog}
                />
              )}
              
              {activeTab === 'password' && (
                <StudentChangePasswordForm
                  studentNis={student.id_nis}
                />
              )}
              
              {activeTab === 'fines' && (
                <StudentFineHistory
                  studentNis={student.id_nis}
                  onRefreshFineHistory={refreshFineHistory}
                />
              )}
              
              {activeTab === 'history' && (
                <StudentCirculationHistory
                  studentNis={student.id_nis}
                  onRefreshCirculationHistory={refreshCirculationHistory}
                  onRefreshStudentProfile={handleRefreshStudentProfile}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
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