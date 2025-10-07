import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
      <p className="text-gray-600">Kelola pengaturan umum sistem perpustakaan.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Pengaturan Umum</CardTitle>
          <CardDescription>Konfigurasi nama perpustakaan, batas peminjaman, dll.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="library-name">Nama Perpustakaan</Label>
            <Input id="library-name" defaultValue="Perpustakaan SMP Negeri 1 Sedati" />
          </div>
          <div>
            <Label htmlFor="max-borrow-days">Maksimal Hari Peminjaman</Label>
            <Input id="max-borrow-days" type="number" defaultValue={7} />
          </div>
          <div>
            <Label htmlFor="fine-per-day">Denda Per Hari (Rp)</Label>
            <Input id="fine-per-day" type="number" defaultValue={1000} />
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;