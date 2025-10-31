import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { getImageUrl } from '@/utils/imageStorage'; // Re-use getImageUrl for preview
import { useAdminAuth } from '@/context/AdminAuthContext'; // Import useAdminAuth

interface BookItem {
  id_buku?: number;
  isbn: string;
  penulis: string;
  tahun_terbit: string;
  judul_buku: string;
  kota_terbit: string;
  penerbit: string;
  no_klasifikasi: string;
  jumlah_buku: string;
  gambar_buku: string; // This will store the path in Supabase Storage
  sinopsis: string;
  id_kategori: number;
  nama_kategori?: string; // This is a derived field, not a column in 'buku' table
  kategori?: { nama_kategori: string } | null; // Menambahkan properti kategori untuk mengatasi error TypeScript
}

interface CategoryItem {
  id_kategori: number;
  nama_kategori: string;
}

interface BookFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bookToEdit?: BookItem | null;
}

const BookFormDialog: React.FC<BookFormDialogProps> = ({ isOpen, onClose, onSave, bookToEdit }) => {
  const { admin } = useAdminAuth(); // Get admin context
  const [formData, setFormData] = useState<BookItem>({
    isbn: '',
    penulis: '',
    tahun_terbit: '',
    judul_buku: '',
    kota_terbit: '',
    penerbit: '',
    no_klasifikasi: '',
    jumlah_buku: '0',
    kode_rak: '',
    gambar_buku: '',
    sinopsis: '',
    id_kategori: 0,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (bookToEdit) {
      // Destructure 'kategori' object from bookToEdit before spreading
      // This ensures the nested 'kategori' object from the join is not included in formData
      const { kategori, ...restOfBookToEdit } = bookToEdit; 
      setFormData({
        ...restOfBookToEdit,
        jumlah_buku: String(restOfBookToEdit.jumlah_buku), // Ensure it's a string for input
      });
      setImagePreviewUrl(getImageUrl(bookToEdit.gambar_buku));
    } else {
      setFormData({
        isbn: '',
        penulis: '',
        tahun_terbit: '',
        judul_buku: '',
        kota_terbit: '',
        penerbit: '',
        no_klasifikasi: '',
        jumlah_buku: '0',
        kode_rak: '',
        gambar_buku: '',
        sinopsis: '',
        id_kategori: 0,
      });
      setImagePreviewUrl(null);
    }
    setImageFile(null); // Reset image file on dialog open/edit
  }, [bookToEdit, isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori')
        .select('id_kategori, nama_kategori')
        .order('nama_kategori', { ascending: true });

      if (error) {
        showError(error.message || 'Gagal mengambil kategori.');
        setCategories([]);
        return;
      }
      if (data) {
        setCategories(data);
        if (!bookToEdit && data.length > 0) {
          setFormData(prev => ({ ...prev, id_kategori: data[0].id_kategori }));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      showError('Terjadi kesalahan saat mengambil kategori.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, id_kategori: parseInt(value) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreviewUrl(bookToEdit?.gambar_buku ? getImageUrl(bookToEdit.gambar_buku) : null);
    }
  };

  const handleSaveBook = async () => {
    setLoading(true);
    let imageUrlPath = formData.gambar_buku;

    try {
      // 1. Upload image if a new file is selected using Edge Function
      if (imageFile) {
        if (!admin?.id || !admin?.username) {
          showError('Admin tidak terautentikasi. Silakan login ulang.');
          setLoading(false);
          return;
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        // Convert image file to base64
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const { data, error: invokeError } = await supabase.functions.invoke('upload-book-image', {
                body: JSON.stringify({
                  imageBase64: reader.result,
                  fileName: fileName,
                  adminId: admin.id,
                  adminUsername: admin.username,
                }),
              });

              if (invokeError) {
                showError(`Gagal mengunggah gambar melalui Edge Function: ${invokeError.message}`);
                setLoading(false);
                reject(invokeError);
                return;
              }
              if (data?.error) {
                showError(`Gagal mengunggah gambar: ${data.error}`);
                setLoading(false);
                reject(new Error(data.error));
                return;
              }
              imageUrlPath = data.path; // Path returned by the Edge Function
              resolve();
            } catch (err) {
              console.error('Error invoking Edge Function:', err);
              showError('Terjadi kesalahan saat memanggil Edge Function unggah gambar.');
              setLoading(false);
              reject(err);
            }
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            showError('Gagal membaca file gambar.');
            setLoading(false);
            reject(error);
          };
        });
      }

      // 2. Prepare data for insert/update, explicitly excluding 'id_buku' and 'nama_kategori'
      // 'kategori' object is already excluded during formData initialization
      const { id_buku, nama_kategori, ...restOfFormData } = formData;

      const dataToSave = {
        ...restOfFormData, // This now only contains actual book columns
        jumlah_buku: String(formData.jumlah_buku), // Ensure it's a string for DB
        gambar_buku: imageUrlPath,
      };

      // 3. Insert or Update book data
      if (bookToEdit?.id_buku) {
        // Update existing book
        const { error } = await supabase
          .from('buku')
          .update(dataToSave)
          .eq('id_buku', bookToEdit.id_buku);

        if (error) {
          showError(error.message || 'Gagal memperbarui buku.');
          setLoading(false);
          return;
        }
        showSuccess('Buku berhasil diperbarui!');
      } else {
        // Insert new book
        const { error } = await supabase
          .from('buku')
          .insert(dataToSave);

        if (error) {
          showError(error.message || 'Gagal menambah buku.');
          setLoading(false);
          return;
        }
        showSuccess('Buku berhasil ditambahkan!');
      }

      onSave(); // Trigger refresh in parent component
      onClose(); // Close dialog
    } catch (err) {
      console.error('Error saving book:', err);
      showError('Terjadi kesalahan tak terduga saat menyimpan buku.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Adjusted max-w for better mobile centering */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{bookToEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          <DialogDescription>
            {bookToEdit ? 'Perbarui detail buku ini.' : 'Isi detail untuk menambah buku baru ke perpustakaan.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="judul_buku" className="text-right">Judul Buku</Label>
            <Input id="judul_buku" value={formData.judul_buku} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="penulis" className="text-right">Penulis</Label>
            <Input id="penulis" value={formData.penulis} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isbn" className="text-right">ISBN</Label>
            <Input id="isbn" value={formData.isbn} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tahun_terbit" className="text-right">Tahun Terbit</Label>
            <Input id="tahun_terbit" value={formData.tahun_terbit} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="penerbit" className="text-right">Penerbit</Label>
            <Input id="penerbit" value={formData.penerbit} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kota_terbit" className="text-right">Kota Terbit</Label>
            <Input id="kota_terbit" value={formData.kota_terbit} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="no_klasifikasi" className="text-right">No. Klasifikasi</Label>
            <Input id="no_klasifikasi" value={formData.no_klasifikasi} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode_rak" className="text-right">Kode Rak</Label>
            <Input id="kode_rak" value={formData.kode_rak} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jumlah_buku" className="text-right">Jumlah Buku</Label>
            <Input id="jumlah_buku" type="number" value={formData.jumlah_buku} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id_kategori" className="text-right">Kategori</Label>
            <Select onValueChange={handleSelectChange} value={String(formData.id_kategori)} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id_kategori} value={String(cat.id_kategori)}>
                    {cat.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="sinopsis" className="text-right pt-2">Sinopsis</Label>
            <Textarea id="sinopsis" value={formData.sinopsis} onChange={handleChange} className="col-span-3" rows={5} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gambar_buku" className="text-right">Gambar Buku</Label>
            <div className="col-span-3 flex flex-col items-start">
              <Input id="gambar_buku" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="Preview" className="mt-2 max-h-40 object-contain rounded-md shadow-sm" />
              )}
              <p className="text-sm text-gray-500 mt-1">Unggah gambar baru atau biarkan kosong untuk mempertahankan yang lama.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <GSAPButton variant="outline" onClick={onClose}>Batal</GSAPButton>
          <GSAPButton onClick={handleSaveBook} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Buku'
            )}
          </GSAPButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormDialog;