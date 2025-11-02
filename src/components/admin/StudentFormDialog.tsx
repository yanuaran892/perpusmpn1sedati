import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { FloatingLabelInput } from '@/components/FloatingLabelInput'; // Menggunakan FloatingLabelInput
import { User, Lock, Maximize2, CheckCircle, XCircle } from 'lucide-react'; // Icons for inputs
import { useAdminAuth } from '@/context/AdminAuthContext'; // Import useAdminAuth

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
  const { admin } = useAdminAuth(); // Get admin context
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
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }

    setLoading(true);
    try {
      if (isNewStudent) {
        // Insert new student using RPC function
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

        const { data, error } = await supabase.rpc('admin_add_student', {
          p_id_nis: formData.id_nis,
          p_nama: formData.nama,
          p_kelas: formData.kelas,
          p_email: formData.email,
          p_password: formData.password,
          p_max_peminjaman: formData.max_peminjaman,
          p_status_siswa: formData.status_siswa,
          p_status_peminjaman: formData.status_peminjaman,
          p_admin_id: admin.id,
          p_admin_username: admin.username,
        });

        if (error || !data) {
          showError(error?.message || 'Gagal menambah siswa.');
          setLoading(false);
          return;
        }
        showSuccess('Siswa berhasil ditambahkan!');
      } else {
        // Update existing student using RPC function
        const { data, error } = await supabase.rpc('admin_update_student', {
          p_id_nis: formData.id_nis,
          p_nama: formData.nama,
          p_kelas: formData.kelas,
          p_email: formData.email,
          p_new_password: formData.password || null, // Pass null if password is not changed
          p_max_peminjaman: formData.max_peminjaman,
          p_status_siswa: formData.status_siswa,
          p_status_peminjaman: formData.status_peminjaman,
          p_admin_id: admin.id,
          p_admin_username: admin.username,
        });

        if (error || !data) {
          showError(error?.message || 'Gagal memperbarui siswa.');
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
          <GSAPButton variant="outline" onClick={onClose}>Batal</GSAPButton>
          <GSAPButton onClick={handleSaveStudent} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Siswa'
            )}
          </GSAPButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;