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

  useEffect(() => {
    const loadStudentFromLocalStorage = () => {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        setStudent(JSON.parse(storedStudent));
      }
      setIsLoading(false);
    };
    loadStudentFromLocalStorage();
  }, []);

  // Modified: fetchStudentProfile now accepts nis as an argument
  const fetchStudentProfile = useCallback(async (nis: string) => {
    console.log('fetchStudentProfile called with NIS:', nis);
    if (!nis) { // Check for valid nis argument
      console.log('fetchStudentProfile: NIS is null or undefined. Exiting early.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Removed redundant set_config call here.
      // It should be set by login_siswa RPC for the session.
      console.log(`fetchStudentProfile: Attempting to fetch student profile for NIS: ${nis}`);

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
  }, [showError]); // Added showError to dependencies

  const login = async (id_nis: string, password: string) => {
    setIsLoading(true);
    try {
      const trimmedNis = id_nis.trim();
      const trimmedPassword = password.trim();

      // login_siswa RPC now sets app.current_nis for the session
      const { data, error } = await supabase.rpc('login_siswa', { id_nis_param: trimmedNis, password_param: trimmedPassword });

      if (error) {
        showError(error.message || 'Login failed');
        setStudent(null);
        localStorage.removeItem('student');
        return false;
      }

      if (data && data.length > 0) {
        const loggedInStudent: Student = data[0];
        setStudent(loggedInStudent);
        localStorage.setItem('student', JSON.stringify(loggedInStudent));
        showSuccess('Login successful!');

        // --- LOGIC TO RECORD STUDENT VISIT ---
        const today = format(new Date(), 'yyyy-MM-dd');
        const currentTime = format(new Date(), 'HH:mm:ss');

        // Check if there's an existing 'berkunjung' entry for this student today
        const { data: existingVisit, error: fetchVisitError } = await supabase
          .from('buku_tamu')
          .select('id_tamu')
          .eq('id_nis', loggedInStudent.id_nis)
          .eq('tanggal', today)
          .eq('status', 'berkunjung')
          .order('waktu', { ascending: false }) // Get the most recent one
          .limit(1);

        if (fetchVisitError) {
          console.error('Error checking existing visit:', fetchVisitError);
          // Continue login process even if visit check fails
        }

        if (!existingVisit || existingVisit.length === 0) {
          // If no active visit found, insert a new one
          const { error: insertVisitError } = await supabase.from('buku_tamu').insert({
            id_nis: loggedInStudent.id_nis,
            nama: loggedInStudent.nama,
            kelas: loggedInStudent.kelas,
            tujuan: 'Membaca/Belajar', // Default purpose for login-triggered visit
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
        // Find the most recent 'berkunjung' entry for this student today
        const { data: activeVisit, error: fetchActiveVisitError } = await supabase
          .from('buku_tamu')
          .select('id_tamu')
          .eq('id_nis', student.id_nis)
          .eq('tanggal', today)
          .eq('status', 'berkunjung')
          .order('waktu', { ascending: false }) // Get the most recent one
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