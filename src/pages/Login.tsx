import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import GSAPButton from '@/components/GSAPButton';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { motion } from 'framer-motion';

const Login = () => {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useStudentAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(nis, password);
    if (success) {
      navigate('/dashboard');
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
            <CardTitle className="text-2xl font-bold text-white">Login Siswa</CardTitle>
            <CardDescription className="text-blue-100">
              Masuk ke Perpustakaan Digital
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
              </div>

              <div className="flex items-center justify-between">
                <GSAPButton
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/landing')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </GSAPButton>
                
                <GSAPButton
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2.5 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </GSAPButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <a href="/student-visit-entry" className="font-medium text-blue-600 hover:text-blue-500">
                  Daftar sebagai pengunjung
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Masuk sebagai{' '}
            <a 
              href="/admin/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Admin
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;