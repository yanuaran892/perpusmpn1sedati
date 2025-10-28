import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface AdminAddFineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFineAdded: () => void; // Callback to refresh data in parent
  adminId: number;
  adminUsername: string;
}

const AdminAddFineDialog: React.FC<AdminAddFineDialogProps> = ({
  isOpen,
  onClose,
  onFineAdded,
  adminId,
  adminUsername,
}) => {
  const [idNis, setIdNis] = useState('');
  const [jumlahDenda, setJumlahDenda] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIdNis('');
      setJumlahDenda('');
      setDescription('');
    }
  }, [isOpen]);

  const handleAddFine = async () => {
    if (!idNis.trim() || !jumlahDenda.trim()) {
      showError('NIS Siswa dan Jumlah Denda harus diisi.');
      return;
    }

    const amount = parseFloat(jumlahDenda);
    if (isNaN(amount) || amount <= 0) {
      showError('Jumlah denda harus angka positif.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_add_manual_fine', {
        p_id_nis: idNis.trim(),
        p_jumlah_denda: amount,
        p_description: description.trim() || 'Denda manual oleh admin',
        p_admin_id: adminId,
        p_admin_username: adminUsername,
      });

      if (error || !data) {
        showError(error?.message || 'Gagal menambahkan denda manual.');
        return;
      }

      showSuccess(`Denda sebesar Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan ke NIS ${idNis}.`);
      onFineAdded(); // Trigger refresh in parent component
      onClose();
    } catch (err) {
      console.error('Error adding manual fine:', err);
      showError('Terjadi kesalahan tak terduga saat menambahkan denda manual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Tambah Denda Manual</DialogTitle>
          <DialogDescription>
            Tambahkan denda secara manual kepada siswa tertentu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="idNis" className="text-right">NIS Siswa</Label>
            <Input
              id="idNis"
              type="text"
              value={idNis}
              onChange={(e) => setIdNis(e.target.value)}
              className="col-span-3"
              placeholder="Masukkan NIS siswa"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jumlahDenda" className="text-right">Jumlah Denda (Rp)</Label>
            <Input
              id="jumlahDenda"
              type="number"
              value={jumlahDenda}
              onChange={(e) => setJumlahDenda(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: 10000"
              min="0"
              step="1000"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
              placeholder="Contoh: Merusak buku, menghilangkan buku"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleAddFine} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menambahkan...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" /> Tambah Denda
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAddFineDialog;