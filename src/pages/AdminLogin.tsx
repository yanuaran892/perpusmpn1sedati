import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock } from 'lucide-react';
import { InputWithIcon } from '@/components/InputWithIcon';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminLogin component rendered.');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 p-4"> {/* Gradien yang lebih dinamis */}
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
              <Label htmlFor="username" className="text-base font-medium text-gray-700">Username</Label>
              <InputWithIcon
                id="username"
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                icon={User}
                className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium text-gray-700">Password</Label>
              <InputWithIcon
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={Lock}
                showPasswordToggle
                className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-md transition-colors duration-300"
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
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;