import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useStudentAuth } from '@/context/StudentAuthContext';

interface FinePaymentRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRequested: () => void; // Callback to refresh student data/history
  currentTotalDenda: number;
}

const FinePaymentRequestDialog: React.FC<FinePaymentRequestDialogProps> = ({
  isOpen,
  onClose,
  onPaymentRequested,
  currentTotalDenda,
}) => {
  const { student, updateStudent } = useStudentAuth();
  const [jumlahBayar, setJumlahBayar] = useState<string>('');
  const [buktiPembayaranFile, setBuktiPembayaranFile] = useState<File | null>(null);
  const [buktiPembayaranPreview, setBuktiPembayaranPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setJumlahBayar(currentTotalDenda > 0 ? String(currentTotalDenda) : '');
      setBuktiPembayaranFile(null);
      setBuktiPembayaranPreview(null);
    }
  }, [isOpen, currentTotalDenda]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation for image type
      if (!file.type.startsWith('image/')) {
        showError('Hanya file gambar yang diizinkan.');
        setBuktiPembayaranFile(null);
        setBuktiPembayaranPreview(null);
        return;
      }
      setBuktiPembayaranFile(file);
      setBuktiPembayaranPreview(URL.createObjectURL(file));
    } else {
      setBuktiPembayaranFile(null);
      setBuktiPembayaranPreview(null);
    }
  };

  const handleSubmitPaymentRequest = async () => {
    if (!student?.id_nis) {
      showError('Siswa tidak terautentikasi. Silakan login ulang.');
      return;
    }

    const amount = parseFloat(jumlahBayar);
    if (isNaN(amount) || amount <= 0) {
      showError('Jumlah pembayaran harus angka positif.');
      return;
    }
    if (amount > currentTotalDenda) {
      showError('Jumlah pembayaran tidak boleh melebihi total denda Anda.');
      return;
    }

    setLoading(true);
    let buktiUrl: string | null = null;

    try {
      if (buktiPembayaranFile) {
        const fileExt = buktiPembayaranFile.name.split('.').pop();
        const fileName = `${student.id_nis}-${Date.now()}.${fileExt}`;
        const filePath = `fine_proofs/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('fine_proofs') // Assuming a 'fine_proofs' bucket exists or will be created
          .upload(filePath, buktiPembayaranFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          showError(uploadError.message || 'Gagal mengunggah bukti pembayaran.');
          setLoading(false);
          return;
        }
        buktiUrl = data.path;
      }

      const { data: rpcResult, error } = await supabase.rpc('request_fine_payment', {
        p_id_nis: student.id_nis,
        p_jumlah_bayar: amount,
        p_bukti_pembayaran_url: buktiUrl,
      });

      if (error) {
        console.error('Supabase RPC Error (request_fine_payment):', error);
        showError(error.message || 'Gagal mengajukan permintaan pembayaran denda.');
        return;
      }

      // Handle the JSON response from the RPC function
      if (rpcResult && rpcResult.success) {
        showSuccess(rpcResult.message);
        onPaymentRequested(); // Trigger refresh in parent
        onClose();
      } else if (rpcResult && !rpcResult.success) {
        showError(rpcResult.message);
      } else {
        // Fallback for unexpected data structure
        showError('Gagal mengajukan permintaan pembayaran denda. Respon tidak terduga.');
      }

    } catch (err) {
      console.error('Error submitting fine payment request:', err);
      showError('Terjadi kesalahan tak terduga saat mengajukan pembayaran denda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg"> {/* Adjusted max-w for better mobile centering */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Ajukan Pembayaran Denda</DialogTitle>
          <DialogDescription>
            Isi detail pembayaran denda Anda. Permintaan akan diverifikasi oleh admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jumlahBayar" className="text-right">Jumlah Bayar</Label>
            <Input
              id="jumlahBayar"
              type="number"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              className="col-span-3"
              placeholder={`Maksimal Rp ${currentTotalDenda.toLocaleString('id-ID')}`}
              min="0"
              step="1000"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="buktiPembayaran" className="text-right pt-2">Bukti Pembayaran (Opsional)</Label>
            <div className="col-span-3 flex flex-col items-start">
              <Input id="buktiPembayaran" type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
              {buktiPembayaranPreview && (
                <img src={buktiPembayaranPreview} alt="Preview Bukti" className="mt-2 max-h-40 object-contain rounded-md shadow-sm" />
              )}
              <p className="text-sm text-gray-500 mt-1">Unggah gambar bukti transfer/pembayaran.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmitPaymentRequest} disabled={loading || parseFloat(jumlahBayar) <= 0 || parseFloat(jumlahBayar) > currentTotalDenda}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengajukan...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" /> Ajukan Pembayaran
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinePaymentRequestDialog;