import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { InputWithIcon } from '@/components/InputWithIcon';

interface StudentChangePasswordFormProps {
  studentNis: string;
}

const StudentChangePasswordForm: React.FC<StudentChangePasswordFormProps> = ({ studentNis }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNis) {
      showError('NIS siswa tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError('Kata sandi baru dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (newPassword.length < 6) {
      showError('Kata sandi baru harus memiliki minimal 6 karakter.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data, error } = await supabase.rpc('update_siswa_password', {
        p_id_nis: studentNis,
        p_old_password: oldPassword,
        p_new_password: newPassword,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal mengubah kata sandi. Pastikan kata sandi lama benar.');
        return;
      }

      showSuccess('Kata sandi berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      showError('Terjadi kesalahan saat mengubah kata sandi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className="shadow-xl border-t-4 border-accent mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Ubah Kata Sandi</CardTitle>
        <CardDescription className="text-gray-600">Perbarui kata sandi akun Anda untuk keamanan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <Label htmlFor="old-password" className="text-base font-medium text-gray-700">Kata Sandi Lama</Label>
            <InputWithIcon
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              icon={Lock}
              showPasswordToggle
              className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="new-password" className="text-base font-medium text-gray-700">Kata Sandi Baru</Label>
            <InputWithIcon
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              icon={Lock}
              showPasswordToggle
              className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <Label htmlFor="confirm-new-password" className="text-base font-medium text-gray-700">Konfirmasi Kata Sandi Baru</Label>
            <InputWithIcon
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              icon={Lock}
              showPasswordToggle
              className="mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <Button type="submit" disabled={isChangingPassword} className="bg-primary hover:bg-primary/90 text-white py-2 px-5 rounded-md transition-colors duration-300">
            {isChangingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengubah...
              </>
            ) : (
              'Ubah Kata Sandi'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentChangePasswordForm;