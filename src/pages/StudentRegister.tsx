import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GSAPButton from '@/components/GSAPButton';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const StudentRegister = () => {
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    
    if (password.length < 6) {
      showError('Password minimal 6 karakter.');
      return;
    }
    
    setLoading(true);
    try {
      // Use RPC function for secure registration and hashing
      // NOTE: Parameter order changed to: p_id_nis, p_nama, p_password, p_email
      const { data: rpcResult, error: rpcError } = await supabase.rpc('register_siswa_secure', {
        p_id_nis: nis,
        p_nama: name,
        p_password: password, // Moved password before email
        p_email: email || null,
      });
      
      if (rpcError) {
        console.error('Registration RPC error:', rpcError);
        showError(rpcError.message || 'Gagal mendaftar. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      if (rpcResult && rpcResult.success) {
        showSuccess(rpcResult.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (rpcResult && !rpcResult.success) {
        showError(rpcResult.message);
      } else {
        showError('Gagal mendaftar. Respon tidak terduga.');
      }

    } catch (err) {
      console.error('Registration error:', err);
      showError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl rounded-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <img
              src="/smpn1sedati_logo.png"
              alt="Logo SMPN 1 SEDATI"
              className="h-20 w-20 object-contain mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold text-white">Daftar Siswa</CardTitle>
            <CardDescription className="text-blue-100">
              Buat akun perpustakaan digital
            </CardDescription>
          </div>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <FloatingLabelInput
                    id="nis"
                    label="Nomor Induk Siswa (NIS)"
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    required
                    icon={User}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <FloatingLabelInput
                    id="name"
                    label="Nama Lengkap"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    icon={User}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <FloatingLabelInput
                    id="email"
                    label="Email (Opsional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="relative">
                  <FloatingLabelInput
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={Lock}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <FloatingLabelInput
                    id="confirmPassword"
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    icon={Lock}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Perhatian:</span> Akun Anda perlu disetujui oleh admin sebelum bisa digunakan untuk login dan meminjam buku.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <GSAPButton
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2.5 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    'Daftar'
                  )}
                </GSAPButton>
                
                <GSAPButton
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </GSAPButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentRegister;