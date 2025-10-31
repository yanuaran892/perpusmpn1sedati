import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StudentVisitEntry = () => {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const currentTime = format(new Date(), 'HH:mm:ss');

      const { error } = await supabase.from('buku_tamu').insert({
        nama: name,
        id_nis: nis || null,
        kelas: kelas || null,
        tujuan: tujuan || null,
        tanggal: today,
        waktu: currentTime,
        status: 'berkunjung',
      });

      if (error) {
        showError(error.message || 'Gagal mencatat kunjungan.');
        return;
      }

      showSuccess('Kunjungan berhasil dicatat! Terima kasih.');
      setName('');
      setNis('');
      setKelas('');
      setTujuan('');
      navigate('/landing');
    } catch (err) {
      console.error('Error submitting guest entry:', err);
      showError('Terjadi kesalahan tak terduga saat mencatat kunjungan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-indigo-600 p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg animate-fade-in-up">
        Pencatatan Kunjungan Siswa
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Perpustakaan SMP NEGERI 1 SEDATI
      </h2>

      <Card className="w-full max-w-md shadow-2xl rounded-xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="text-center pt-8">
          <img
            src="/smpn1sedati_logo.png"
            alt="Logo SMPN 1 SEDATI"
            className="h-24 w-24 object-contain mx-auto mb-4 animate-pulse"
          />
          <CardTitle className="text-2xl font-bold text-primary">Selamat Datang Pengunjung</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Mohon isi data kunjungan Anda untuk masuk ke perpustakaan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium text-gray-700">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="nis" className="text-base font-medium text-gray-700">NIS (Opsional)</Label>
              <Input
                id="nis"
                type="text"
                placeholder="Jika Anda siswa, masukkan NIS"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="kelas" className="text-base font-medium text-gray-700">Kelas (Opsional)</Label>
              <Input
                id="kelas"
                type="text"
                placeholder="Jika Anda siswa, masukkan kelas Anda"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="tujuan" className="text-base font-medium text-gray-700">Tujuan Kunjungan (Opsional)</Label>
              <Input
                id="tujuan"
                type="text"
                placeholder="Contoh: Membaca buku, mencari referensi"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <GSAPButton
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold rounded-md transition-colors duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mencatat...
                </>
              ) : (
                'Catat Kunjungan'
              )}
            </GSAPButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentVisitEntry;