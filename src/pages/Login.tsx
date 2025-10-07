import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock, ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon
import { InputWithIcon } from '@/components/InputWithIcon';

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
        <CardHeader className="text-center pt-8 relative"> {/* Added relative for positioning the button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/landing')} // Navigate back to landing page
            className="absolute top-4 left-4 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
              <Label htmlFor="nis" className="text-base font-medium text-gray-700">NIS</Label>
              <InputWithIcon
                id="nis"
                type="text"
                placeholder="Masukkan NIS"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                required
                icon={User}
                className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium text-gray-700">Password</Label>
              <InputWithIcon
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={Lock}
                showPasswordToggle
                className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <Button
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
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;