import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, UserCircle } from 'lucide-react';

interface Student {
  id_nis: string;
  nama: string;
  kelas: string;
  email?: string;
  total_pinjam: number;
  sedang_pinjam: number;
  max_peminjaman: number;
  total_denda: number;
  status_siswa: string;
  status_peminjaman: string;
}

interface StudentProfileInfoProps {
  student: Student;
  onOpenFinePaymentDialog: () => void;
}

const StudentProfileInfo: React.FC<StudentProfileInfoProps> = ({ student, onOpenFinePaymentDialog }) => {
  return (
    <Card className="shadow-xl border-t-4 border-primary mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-3xl font-bold text-primary">Informasi Profil</CardTitle>
          <CardDescription className="text-gray-600 text-base">Detail lengkap mengenai akun Anda.</CardDescription>
        </div>
        <UserCircle className="h-12 w-12 text-primary/70" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-gray-500 text-sm">NIS:</p>
            <p className="font-semibold text-lg text-foreground">{student.id_nis}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Nama:</p>
            <p className="font-semibold text-lg text-foreground">{student.nama}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Kelas:</p>
            <p className="font-semibold text-lg text-foreground">{student.kelas}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email:</p>
            <p className="font-semibold text-lg text-foreground">{student.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Peminjaman:</p>
            <p className="font-semibold text-lg text-foreground">{student.total_pinjam}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Sedang Dipinjam:</p>
            <p className="font-semibold text-lg text-foreground">{student.sedang_pinjam} / {student.max_peminjaman}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Denda:</p>
            <p className="font-semibold text-lg text-red-600">Rp {student.total_denda.toLocaleString('id-ID')}</p>
            {student.total_denda > 0 && (
              <Button
                variant="default"
                size="sm"
                className="mt-3 bg-red-500 hover:bg-red-600 text-white shadow-md"
                onClick={onOpenFinePaymentDialog}
              >
                <DollarSign className="mr-2 h-4 w-4" /> Bayar Denda
              </Button>
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm">Status Siswa:</p>
            <p className={`font-semibold text-lg ${student.status_siswa === 'aktif' ? 'text-accent' : 'text-red-600'}`}>{student.status_siswa}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfileInfo;