import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { FloatingLabelInput } from '@/components/FloatingLabelInput'; // Menggunakan FloatingLabelInput
import { User, Lock, Maximize2, CheckCircle, XCircle } from 'lucide-react'; // Icons for inputs

interface StudentItem {
  id_nis: string;
  nama: string;
  kelas: string;
  email: string | null;
  password?: string; // Optional for editing, required for new
  total_pinjam: number;
  sedang_pinjam: number;
  max_peminjaman: number;
  total_denda: number;
  status_siswa: string;
  status_peminjaman: string;
}

interface StudentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  studentToEdit?: StudentItem | null;
}

const StudentFormDialog: React.FC<StudentFormDialogProps> = ({ isOpen, onClose, onSave, studentToEdit }) => {
  const [formData, setFormData] = useState<StudentItem>({
    id_nis: '',
    nama: '',
    kelas: '',
    email: '',
    password: '',
    total_pinjam: 0,
    sedang_pinjam: 0,
    max_peminjaman: 3,
    total_denda: 0,
    status_siswa: 'aktif',
    status_peminjaman: 'aktif',
  });
  const [loading, setLoading] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        ...studentToEdit,
        password: '', // Never pre-fill password for security
      });
      setIsNewStudent(false);
    } else {
      setFormData({
        id_nis: '',
        nama: '',
        kelas: '',
        email: '',
        password: '',
        total_pinjam: 0,
        sedang_pinjam: 0,
        max_peminjaman: 3,
        total_denda: 0,
        status_siswa: 'aktif',
        status_peminjaman: 'aktif',
      });
      setIsNewStudent(true);
    }
  }, [studentToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveStudent = async () => {
    setLoading(true);
    try {
      if (isNewStudent) {
        // Insert new student
        if (!formData.id_nis || !formData.nama || !formData.kelas || !formData.password) {
          showError('NIS, Nama, Kelas, dan Password harus diisi.');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          showError('Password minimal 6 karakter.');
          setLoading(false);
          return;
        }

        // Hash password before inserting
        const { data: hashedPasswordData, error: hashError } = await supabase.rpc('crypt', {
          _text: formData.password,
          _salt: await supabase.rpc('gen_salt', { _type: 'bf' }),
        });

        if (hashError) {
          showError(hashError.message || 'Gagal mengenkripsi password.');
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from('siswa')
          .insert({
            id_nis: formData.id_nis,
            nama: formData.nama,
            kelas: formData.kelas,
            email: formData.email,
            password: hashedPasswordData, // Use hashed password
            max_peminjaman: formData.max_peminjaman,
            status_siswa: formData.status_siswa,
            status_peminjaman: formData.status_peminjaman,
            // total_pinjam, sedang_pinjam, total_denda default to 0 in DB
          });

        if (error) {
          showError(error.message || 'Gagal menambah siswa.');
          setLoading(false);
          return;
        }
        showSuccess('Siswa berhasil ditambahkan!');
      } else {
        // Update existing student
        const updateData: Partial<StudentItem> = {
          nama: formData.nama,
          kelas: formData.kelas,
          email: formData.email,
          max_peminjaman: formData.max_peminjaman,
          status_siswa: formData.status_siswa,
          status_peminjaman: formData.status_peminjaman,
        };

        // Only update password if a new one is provided
        if (formData.password) {
          if (formData.password.length < 6) {
            showError('Password baru minimal 6 karakter.');
            setLoading(false);
            return;
          }
          // Use the RPC function to update password securely
          const { data: hashedPasswordData, error: hashError } = await supabase.rpc('crypt', {
            _text: formData.password,
            _salt: await supabase.rpc('gen_salt', { _type: 'bf' }),
          });

          if (hashError) {
            showError(hashError.message || 'Gagal mengenkripsi password baru.');
            setLoading(false);
            return;
          }
          updateData.password = hashedPasswordData;
        }

        const { error } = await supabase
          .from('siswa')
          .update(updateData)
          .eq('id_nis', formData.id_nis);

        if (error) {
          showError(error.message || 'Gagal memperbarui siswa.');
          setLoading(false);
          return;
        }
        showSuccess('Data siswa berhasil diperbarui!');
      }

      onSave(); // Trigger refresh in parent component
      onClose(); // Close dialog
    } catch (err) {
      console.error('Error saving student:', err);
      showError('Terjadi kesalahan tak terduga saat menyimpan data siswa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto"> {/* Adjusted max-w for better mobile centering */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{isNewStudent ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}</DialogTitle>
          <DialogDescription>
            {isNewStudent ? 'Isi detail untuk menambah siswa baru ke sistem.' : 'Perbarui detail siswa ini.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id_nis" className="text-right">NIS</Label>
            <FloatingLabelInput
              id="id_nis"
              type="text"
              label="Nomor Induk Siswa"
              value={formData.id_nis}
              onChange={handleChange}
              className="col-span-3"
              icon={User}
              required
              disabled={!isNewStudent} // NIS cannot be changed for existing students
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">Nama</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelas" className="text-right">Kelas</Label>
            <Input
              id="kelas"
              value={formData.kelas}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password {isNewStudent ? '' : '(Kosongkan jika tidak diubah)'}</Label>
            <FloatingLabelInput
              id="password"
              label={isNewStudent ? "Password" : "Password baru"}
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="col-span-3"
              icon={Lock}
              showPasswordToggle
              required={isNewStudent}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max_peminjaman" className="text-right">Max Peminjaman</Label>
            <Input
              id="max_peminjaman"
              type="number"
              value={formData.max_peminjaman}
              onChange={handleChange}
              className="col-span-3"
              min="0"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status_siswa" className="text-right">Status Siswa</Label>
            <Select onValueChange={(value) => handleSelectChange('status_siswa', value)} value={formData.status_siswa} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Status Siswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status_peminjaman" className="text-right">Status Peminjaman</Label>
            <Select onValueChange={(value) => handleSelectChange('status_peminjaman', value)} value={formData.status_peminjaman} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Status Peminjaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSaveStudent} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Siswa'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;