import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface Admin {
  id: number;
  username: string;
  created_at: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: React.PropsWithChildren) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminFromLocalStorage = () => {
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
      setIsLoading(false);
    };
    loadAdminFromLocalStorage();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const { data, error } = await supabase.rpc('login_admin', {
        p_username: trimmedUsername,
        p_password: trimmedPassword,
      });

      if (error) {
        showError(error.message || 'Login admin gagal.');
        setAdmin(null);
        localStorage.removeItem('admin');
        return false;
      }

      if (data && data.length > 0) {
        const loggedInAdmin: Admin = data[0];
        setAdmin(loggedInAdmin);
        localStorage.setItem('admin', JSON.stringify(loggedInAdmin));
        showSuccess('Login admin berhasil!');
        return true;
      } else {
        showError('Username atau password admin salah.');
        setAdmin(null);
        localStorage.removeItem('admin');
        return false;
      }
    } catch (err) {
      console.error('Login admin error:', err);
      showError('Terjadi kesalahan tak terduga saat login admin.');
      setAdmin(null);
      localStorage.removeItem('admin');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    showSuccess('Admin berhasil logout.');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};