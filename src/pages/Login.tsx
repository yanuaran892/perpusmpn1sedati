import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock, ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon
import { FloatingLabelInput } from '@/components/FloatingLabelInput'; // Menggunakan FloatingLabelInput

const Login = () => {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-indigo-600 p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg animate-fade-in-up">
        SISTEM PERPUSTAKAAN
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        SMP NEGERI 1 SEDATI
      </h2>

      <Card className="w-full max-w-md shadow-2xl rounded-xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="text-center pt-8 relative">
          <GSAPButton
            variant="ghost"
            size="icon"
            onClick={() => navigate('/landing')}
            className="absolute top-4 left-4 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </GSAPButton>
          <img
            src="/smpn1sedati_logo.png"
            alt="Logo SMPN 1 SEDATI"
            className="h-24 w-24 object-contain mx-auto mb-4 animate-pulse"
          />
          <CardDescription className="text-gray-600 text-base">
            Masukkan NIS dan password untuk mengakses buku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FloatingLabelInput
                id="nis"
                label="NIS"
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                required
                icon={User}
              />
            </div>
            <div>
              <FloatingLabelInput
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={Lock}
                showPasswordToggle
              />
            </div>
            <GSAPButton
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold rounded-md transition-colors duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </GSAPButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;