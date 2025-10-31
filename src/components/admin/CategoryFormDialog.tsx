import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface CategoryItem {
  id_kategori?: number;
  nama_kategori: string;
  deskripsi: string | null;
  warna: string | null;
}

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  categoryToEdit?: CategoryItem | null;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
  const [formData, setFormData] = useState<CategoryItem>({
    nama_kategori: '',
    deskripsi: '',
    warna: '#000000', // Default color
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        ...categoryToEdit,
        warna: categoryToEdit.warna || '#000000', // Ensure default color if null
      });
    } else {
      setFormData({
        nama_kategori: '',
        deskripsi: '',
        warna: '#000000',
      });
    }
  }, [categoryToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveCategory = async () => {
    setLoading(true);
    try {
      if (categoryToEdit?.id_kategori) {
        // Update existing category
        const { error } = await supabase
          .from('kategori')
          .update(formData)
          .eq('id_kategori', categoryToEdit.id_kategori);

        if (error) {
          showError(error.message || 'Gagal memperbarui kategori.');
          setLoading(false);
          return;
        }
        showSuccess('Kategori berhasil diperbarui!');
      } else {
        // Insert new category
        const { error } = await supabase
          .from('kategori')
          .insert(formData);

        if (error) {
          showError(error.message || 'Gagal menambah kategori.');
          setLoading(false);
          return;
        }
        showSuccess('Kategori berhasil ditambahkan!');
      }

      onSave(); // Trigger refresh in parent component
      onClose(); // Close dialog
    } catch (err) {
      console.error('Error saving category:', err);
      showError('Terjadi kesalahan tak terduga saat menyimpan kategori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg"> {/* Adjusted max-w for better mobile centering */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{categoryToEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
          <DialogDescription>
            {categoryToEdit ? 'Perbarui detail kategori ini.' : 'Isi detail untuk menambah kategori baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama_kategori" className="text-right">Nama Kategori</Label>
            <Input id="nama_kategori" value={formData.nama_kategori} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="deskripsi" className="text-right pt-2">Deskripsi</Label>
            <Textarea id="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} className="col-span-3" rows={3} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="warna" className="text-right">Warna</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input id="warna" type="color" value={formData.warna || '#000000'} onChange={handleChange} className="w-12 h-8 p-0 border-none" />
              <Input id="warna-text" type="text" value={formData.warna || '#000000'} onChange={handleChange} className="flex-grow" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <GSAPButton variant="outline" onClick={onClose}>Batal</GSAPButton>
          <GSAPButton onClick={handleSaveCategory} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Kategori'
            )}
          </GSAPButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;