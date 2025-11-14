import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns'; // Import format from date-fns

interface Student {
  id_nis: string;
  nama: string;
  kelas: string;
  email?: string;
  total_pinjam: number;
  sedang_pinjam: number;
  max_peminjaman: number;
  total_denda: number;
  status_siswa: string;
  status_peminjaman: string;
}

interface StudentAuthContextType {
  student: Student | null;
  login: (id_nis: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStudent: (newStudentData: Partial<Student>) => void;
  fetchStudentProfile: (nis: string) => Promise<void>; // Modified: accepts nis
  isLoading: boolean;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const StudentAuthProvider = ({ children }: React.PropsWithChildren) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to set the session NIS in Supabase
  const setSessionNis = useCallback(async (nis: string | null) => {
    if (nis) {
      try {
        // Call the RPC function to set app.current_nis in the database session
        const { error } = await supabase.rpc('set_student_session_nis', { p_id_nis: nis });
        if (error) {
          console.error('Error setting app.current_nis in session:', error);
        } else {
          console.log('app.current_nis set in session:', nis);
        }
      } catch (err) {
        console.error('Unexpected error setting app.current_nis in session:', err);
      }
    }
  }, []);

  useEffect(() => {
    const loadStudentFromLocalStorage = async () => { // Made async
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        const parsedStudent: Student = JSON.parse(storedStudent);
        setStudent(parsedStudent);
        await setSessionNis(parsedStudent.id_nis); // Set session NIS on load
      }
      setIsLoading(false);
    };
    loadStudentFromLocalStorage();
  }, [setSessionNis]); // Dependency on setSessionNis

  const fetchStudentProfile = useCallback(async (nis: string) => {
    console.log('fetchStudentProfile called with NIS:', nis);
    if (!nis) {
      console.log('fetchStudentProfile: NIS is null or undefined. Exiting early.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Ensure session NIS is set before fetching profile, in case it was lost
      await setSessionNis(nis); // Set session NIS before fetching

      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('id_nis', nis.trim());

      if (error) {
        console.error('fetchStudentProfile: Error fetching student profile:', error);
        showError(error.message || 'Gagal memuat profil siswa terbaru.');
        setStudent(null);
        localStorage.removeItem('student');
      } else if (data && data.length > 0) {
        console.log('fetchStudentProfile: Student profile data fetched successfully:', data[0]);
        setStudent(data[0]);
        localStorage.setItem('student', JSON.stringify(data[0]));
      } else {
        console.warn(`fetchStudentProfile: No student found with NIS: ${nis} during profile fetch. Data was null or empty.`);
        showError('Profil siswa tidak ditemukan. Silakan login ulang.');
        setStudent(null);
        localStorage.removeItem('student');
      }
    } catch (err) {
      console.error('fetchStudentProfile: Unexpected error fetching student profile:', err);
      showError('Terjadi kesalahan tak terduga saat memuat profil siswa.');
      setStudent(null);
      localStorage.removeItem('student');
    } finally {
      setIsLoading(false);
    }
  }, [showError, setSessionNis]); // Added setSessionNis to dependencies

  const login = async (id_nis: string, password: string) => {
    setIsLoading(true);
    try {
      const trimmedNis = id_nis.trim();
      const trimmedPassword = password.trim();

      const { data, error } = await supabase.rpc('login_siswa', { id_nis_param: trimmedNis, password_param: trimmedPassword });

      if (error) {
        showError(error.message || 'Login failed');
        setStudent(null);
        localStorage.removeItem('student');
        return false;
      }

      if (data && data.length > 0) {
        const loggedInStudent: Student = data[0];
        
        // Check if student account is approved
        if (loggedInStudent.status_siswa === 'pending') {
          showError('Akun Anda sedang menunggu persetujuan admin. Silakan coba lagi nanti.');
          setStudent(null);
          localStorage.removeItem('student');
          return false;
        }
        
        if (loggedInStudent.status_siswa === 'rejected') {
          showError('Akun Anda ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.');
          setStudent(null);
          localStorage.removeItem('student');
          return false;
        }
        
        setStudent(loggedInStudent);
        localStorage.setItem('student', JSON.stringify(loggedInStudent));
        showSuccess('Login successful!');
        await setSessionNis(loggedInStudent.id_nis); // Ensure session NIS is set after login

        // --- LOGIC TO RECORD STUDENT VISIT ---
        const today = format(new Date(), 'yyyy-MM-dd');
        const currentTime = format(new Date(), 'HH:mm:ss');

        const { data: existingVisit, error: fetchVisitError } = await supabase
          .from('buku_tamu')
          .select('id_tamu')
          .eq('id_nis', loggedInStudent.id_nis)
          .eq('tanggal', today)
          .eq('status', 'berkunjung')
          .order('waktu', { ascending: false })
          .limit(1);

        if (fetchVisitError) {
          console.error('Error checking existing visit:', fetchVisitError);
        }

        if (!existingVisit || existingVisit.length === 0) {
          const { error: insertVisitError } = await supabase.from('buku_tamu').insert({
            id_nis: loggedInStudent.id_nis,
            nama: loggedInStudent.nama,
            kelas: loggedInStudent.kelas,
            tujuan: 'Membaca/Belajar',
            tanggal: today,
            waktu: currentTime,
            status: 'berkunjung',
          });

          if (insertVisitError) {
            console.error('Error recording student visit on login:', insertVisitError);
            showError('Gagal mencatat kunjungan perpustakaan otomatis.');
          } else {
            console.log('Student visit recorded successfully on login.');
          }
        } else {
          console.log('Student already has an active visit recorded today.');
        }
        // --- END LOGIC TO RECORD STUDENT VISIT ---

        return true;
      } else {
        showError('Invalid NIS or password.');
        setStudent(null);
        localStorage.removeItem('student');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('An unexpected error occurred during login.');
      setStudent(null);
      localStorage.removeItem('student');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (student?.id_nis) {
      // --- LOGIC TO UPDATE STUDENT VISIT STATUS ON LOGOUT ---
      const today = format(new Date(), 'yyyy-MM-dd');

      try {
        const { data: activeVisit, error: fetchActiveVisitError } = await supabase
          .from('buku_tamu')
          .select('id_tamu')
          .eq('id_nis', student.id_nis)
          .eq('tanggal', today)
          .eq('status', 'berkunjung')
          .order('waktu', { ascending: false })
          .limit(1);

        if (fetchActiveVisitError) {
          console.error('Error fetching active visit for logout:', fetchActiveVisitError);
        }

        if (activeVisit && activeVisit.length > 0) {
          const visitIdToUpdate = activeVisit[0].id_tamu;
          const { error: updateVisitError } = await supabase
            .from('buku_tamu')
            .update({ status: 'selesai' })
            .eq('id_tamu', visitIdToUpdate);

          if (updateVisitError) {
            console.error('Error updating student visit on logout:', updateVisitError);
            showError('Gagal memperbarui status kunjungan perpustakaan otomatis.');
          } else {
            console.log('Student visit status updated to "selesai" on logout.');
          }
        } else {
          console.log('No active visit found for student to update on logout.');
        }
      } catch (err) {
        console.error('Error during logout visit update:', err);
        showError('Terjadi kesalahan tak terduga saat memperbarui status kunjungan.');
      }
      // --- END LOGIC TO UPDATE STUDENT VISIT STATUS ON LOGOUT ---
    }

    setStudent(null);
    localStorage.removeItem('student');
    showSuccess('Logged out successfully.');
    await setSessionNis(null); // Clear session NIS on logout
  };

  const updateStudent = (newStudentData: Partial<Student>) => {
    setStudent(prevStudent => {
      if (prevStudent) {
        const updated = { ...prevStudent, ...newStudentData };
        localStorage.setItem('student', JSON.stringify(updated));
        return updated;
      }
      return prevStudent;
    });
  };

  return (
    <StudentAuthContext.Provider value={{ student, login, logout, updateStudent, fetchStudentProfile, isLoading }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};