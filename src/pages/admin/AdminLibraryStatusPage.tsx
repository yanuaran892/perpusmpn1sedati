import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import GSAPButton from '@/components/GSAPButton';
import { Loader2, Calendar, Trash2, PlusCircle, Power, PowerOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { format as formatDate, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LibraryStatus {
  is_open: boolean;
  manual_status: boolean;
  is_holiday: boolean;
  holiday_name: string | null;
  last_updated: string;
  updated_by: string | null;
}

interface Holiday {
  id: number;
  holiday_date: string;
  holiday_name: string;
  is_recurring: boolean;
  created_at: string;
}

const AdminLibraryStatusPage = () => {
  const { admin } = useAdminAuth();
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
  // Form state for adding holiday
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

  useEffect(() => {
    fetchLibraryStatus();
    fetchHolidays();
  }, []);

  const fetchLibraryStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_library_status');
      
      if (error) {
        showError(error.message || 'Gagal mengambil status perpustakaan.');
        return;
      }
      
      if (data) {
        setLibraryStatus(data as LibraryStatus);
      }
    } catch (err) {
      console.error('Error fetching library status:', err);
      showError('Terjadi kesalahan saat mengambil status perpustakaan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_holidays');
      
      if (error) {
        showError(error.message || 'Gagal mengambil daftar hari libur.');
        return;
      }
      
      if (data) {
        setHolidays(data as Holiday[]);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
      showError('Terjadi kesalahan saat mengambil daftar hari libur.');
    }
  };

  const handleToggleStatus = async () => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }

    setIsToggling(true);
    try {
      const { data, error } = await supabase.rpc('toggle_library_status', {
        p_admin_id: admin.id,
        p_admin_username: admin.username,
      });

      if (error) {
        showError(error.message || 'Gagal mengubah status perpustakaan.');
        return;
      }

      if (data && data.success) {
        showSuccess(data.message);
        fetchLibraryStatus();
      } else {
        showError(data?.message || 'Gagal mengubah status perpustakaan.');
      }
    } catch (err) {
      console.error('Error toggling library status:', err);
      showError('Terjadi kesalahan saat mengubah status perpustakaan.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }

    if (!newHolidayDate || !newHolidayName) {
      showError('Tanggal dan nama hari libur harus diisi.');
      return;
    }

    setIsAddingHoliday(true);
    try {
      const { data, error } = await supabase.rpc('add_holiday', {
        p_holiday_date: newHolidayDate,
        p_holiday_name: newHolidayName,
        p_is_recurring: isRecurring,
        p_admin_id: admin.id,
        p_admin_username: admin.username,
      });

      if (error) {
        showError(error.message || 'Gagal menambahkan hari libur.');
        return;
      }

      if (data && data.success) {
        showSuccess(data.message);
        setNewHolidayDate('');
        setNewHolidayName('');
        setIsRecurring(false);
        fetchHolidays();
        fetchLibraryStatus(); // Refresh status in case today is the new holiday
      } else {
        showError(data?.message || 'Gagal menambahkan hari libur.');
      }
    } catch (err) {
      console.error('Error adding holiday:', err);
      showError('Terjadi kesalahan saat menambahkan hari libur.');
    } finally {
      setIsAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: number, holidayName: string) => {
    if (!admin?.id || !admin?.username) {
      showError('Admin tidak terautentikasi. Silakan login ulang.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus hari libur "${holidayName}"?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('delete_holiday', {
        p_holiday_id: holidayId,
        p_admin_id: admin.id,
        p_admin_username: admin.username,
      });

      if (error) {
        showError(error.message || 'Gagal menghapus hari libur.');
        return;
      }

      if (data && data.success) {
        showSuccess(data.message);
        fetchHolidays();
        fetchLibraryStatus(); // Refresh status in case today was the deleted holiday
      } else {
        showError(data?.message || 'Gagal menghapus hari libur.');
      }
    } catch (err) {
      console.error('Error deleting holiday:', err);
      showError('Terjadi kesalahan saat menghapus hari libur.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl text-gray-700">Memuat status perpustakaan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Status Perpustakaan</h1>
      <p className="text-gray-600">Kelola status buka/tutup perpustakaan dan hari libur.</p>

      {/* Library Status Card */}
      <Card className="shadow-lg border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center">
            {libraryStatus?.is_open ? (
              <Power className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <PowerOff className="h-6 w-6 text-red-500 mr-2" />
            )}
            Status Perpustakaan Saat Ini
          </CardTitle>
          <CardDescription>
            Kontrol status operasional perpustakaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {libraryStatus?.is_holiday && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Hari ini adalah hari libur: <strong>{libraryStatus.holiday_name}</strong>. 
                Perpustakaan otomatis tutup.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {libraryStatus?.is_open ? 'BUKA' : 'TUTUP'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Status Manual: {libraryStatus?.manual_status ? 'Buka' : 'Tutup'}
              </p>
              {libraryStatus?.last_updated && (
                <p className="text-xs text-gray-500 mt-1">
                  Terakhir diubah: {formatDate(parseISO(libraryStatus.last_updated), 'dd MMM yyyy HH:mm', { locale: id })}
                  {libraryStatus.updated_by && ` oleh ${libraryStatus.updated_by}`}
                </p>
              )}
            </div>
            <GSAPButton
              onClick={handleToggleStatus}
              disabled={isToggling || libraryStatus?.is_holiday}
              className={`${
                libraryStatus?.manual_status
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-8 py-4 text-lg`}
            >
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengubah...
                </>
              ) : (
                <>
                  {libraryStatus?.manual_status ? (
                    <>
                      <PowerOff className="mr-2 h-5 w-5" />
                      Tutup Perpustakaan
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-5 w-5" />
                      Buka Perpustakaan
                    </>
                  )}
                </>
              )}
            </GSAPButton>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Saat perpustakaan tutup, siswa tidak dapat mengajukan peminjaman buku</li>
              <li>Pada hari libur nasional, perpustakaan otomatis tutup</li>
              <li>Denda keterlambatan tidak dihitung pada hari libur dan akhir pekan</li>
              <li>Perhitungan denda hanya berlaku pada hari kerja perpustakaan</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add Holiday Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Tambah Hari Libur</CardTitle>
          <CardDescription>Tambahkan hari libur baru ke sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="holiday-date">Tanggal</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="holiday-name">Nama Hari Libur</Label>
              <Input
                id="holiday-name"
                type="text"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="Contoh: Hari Kemerdekaan RI"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Berulang Setiap Tahun
                </Label>
              </div>
            </div>
          </div>
          <GSAPButton
            onClick={handleAddHoliday}
            disabled={isAddingHoliday || !newHolidayDate || !newHolidayName}
          >
            {isAddingHoliday ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menambahkan...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Hari Libur
              </>
            )}
          </GSAPButton>
        </CardContent>
      </Card>

      {/* Holidays List Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Daftar Hari Libur</CardTitle>
          <CardDescription>Kelola hari libur nasional dan cuti bersama</CardDescription>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Belum ada hari libur terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Hari Libur</TableHead>
                    <TableHead>Berulang</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {formatDate(parseISO(holiday.holiday_date), 'dd MMMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>{holiday.holiday_name}</TableCell>
                      <TableCell>
                        {holiday.is_recurring ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            Ya
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                            Tidak
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <GSAPButton
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.id, holiday.holiday_name)}
                        >
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
    </div>
  );
};

export default AdminLibraryStatusPage;