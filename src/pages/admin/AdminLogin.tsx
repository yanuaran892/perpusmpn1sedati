import React, { useState } => 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock } from 'lucide-react';
import { FloatingLabelInput } from '@/components/FloatingLabelInput'; // Menggunakan FloatingLabelInput

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-indigo-600 p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg animate-fade-in-up">
        ADMIN PANEL
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        PERPUSTAKAAN SMP NEGERI 1 SEDATI
      </h2>

      <Card className="w-full max-w-md shadow-2xl rounded-xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="text-center pt-8">
          <img
            src="/smpn1sedati_logo.png"
            alt="Logo SMPN 1 SEDATI"
            className="h-24 w-24 object-contain mx-auto mb-4 animate-pulse"
          />
          <CardDescription className="text-gray-600 text-base">
            Masukkan username dan password admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FloatingLabelInput
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                'Masuk Admin'
              )}
            </GSAPButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;