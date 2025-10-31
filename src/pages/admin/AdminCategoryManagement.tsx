import React, { useState, useEffect } from 'react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import CategoryFormDialog from '@/components/admin/CategoryFormDialog'; // Import the new dialog component

interface CategoryItem {
  id_kategori: number;
  nama_kategori: string;
  deskripsi: string | null;
  warna: string | null;
}

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('kategori')
        .select('*')
        .order('nama_kategori', { ascending: true });

      if (searchTerm) {
        query = query.ilike('nama_kategori', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        showError(error.message || 'Gagal mengambil data kategori.');
        setCategories([]);
        return;
      }
      if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data kategori.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id_kategori: number, nama_kategori: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${nama_kategori}"? Ini juga akan mempengaruhi buku yang terkait.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('kategori')
        .delete()
        .eq('id_kategori', id_kategori);

      if (error) {
        showError(error.message || 'Gagal menghapus kategori.');
        return;
      }

      showSuccess(`Kategori "${nama_kategori}" berhasil dihapus.`);
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error('Error deleting category:', err);
      showError('Terjadi kesalahan tak terduga saat menghapus kategori.');
    }
  };

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleEditCategory = (category: CategoryItem) => {
    setCategoryToEdit(category);
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Kategori</h1>
      <p className="text-gray-600">Kelola kategori buku di perpustakaan.</p>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Added flex for alignment */}
          <CardTitle className="text-2xl text-foreground">Daftar Kategori</CardTitle>
          <GSAPButton onClick={handleAddCategory} size="sm"> {/* Moved button here */}
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
          </GSAPButton>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat kategori...</p>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada kategori ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Warna</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id_kategori}>
                      <TableCell className="font-medium">{category.nama_kategori}</TableCell>
                      <TableCell>{category.deskripsi || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span
                            className="inline-block h-4 w-4 rounded-full mr-2"
                            style={{ backgroundColor: category.warna || '#ccc' }}
                          ></span>
                          {category.warna || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <GSAPButton variant="ghost" size="sm" className="mr-2" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </GSAPButton>
                        <GSAPButton variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id_kategori, category.nama_kategori)}>
                          <Trash2 className="h-4 w-4" />
                        </GSAPButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};

export default AdminCategoryManagement;