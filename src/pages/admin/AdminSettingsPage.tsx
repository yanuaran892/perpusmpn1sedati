import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface SettingsData {
  max_borrow_days: number;
  max_extension_count: number;
  fine_per_day: number;
  library_name: string;
}

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<SettingsData>({
    max_borrow_days: 3,
    max_extension_count: 3,
    fine_per_day: 1000,
    library_name: "Perpustakaan SMP Negeri 1 Sedati",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch these from a 'settings' table.
      // For now, we'll use hardcoded defaults and simulate fetching.
      // If you want to persist these, you'd need a 'settings' table and corresponding RLS.
      const { data, error } = await supabase
        .from('app_settings') // Assuming a table named 'app_settings'
        .select('*')
        .limit(1);

      if (error && error.code !== '42P01') { // Ignore 'undefined table' error for now
        console.warn('Error fetching settings (might be table not found):', error.message);
      }

      if (data && data.length > 0) {
        setSettings({
          max_borrow_days: data[0].max_borrow_days || 3,
          max_extension_count: data[0].max_extension_count || 3,
          fine_per_day: data[0].fine_per_day || 1000,
          library_name: data[0].library_name || "Perpustakaan SMP Negeri 1 Sedati",
        });
      } else {
        // If no settings found, insert defaults (or just use initial state)
        // This part would also require a 'settings' table and RLS
        console.log('No settings found, using default values.');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showError('Terjadi kesalahan saat memuat pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real application, you would update these in a 'settings' table.
      // For now, we'll just simulate saving.
      // This would require a 'settings' table and RLS for update.
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            id: 1, // Assuming a single row for settings
            max_borrow_days: settings.max_borrow_days,
            max_extension_count: settings.max_extension_count,
            fine_per_day: settings.fine_per_day,
            library_name: settings.library_name,
          },
          { onConflict: 'id' }
        );

      if (error) {
        showError(error.message || 'Gagal menyimpan pengaturan.');
        setIsSaving(false);
        return;
      }

      showSuccess('Pengaturan berhasil disimpan!');
    } catch (err) {
      console.error('Error saving settings:', err);
      showError('Terjadi kesalahan tak terduga saat menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [id.replace(/-/g, '_')]: id === 'library-name' ? value : parseInt(value) || 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl text-gray-700">Memuat pengaturan...</p>
      </div>
    );
  }

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
            <Input id="library-name" value={settings.library_name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="max-borrow-days">Maksimal Hari Peminjaman</Label>
            <Input id="max-borrow-days" type="number" value={settings.max_borrow_days} onChange={handleChange} min={1} />
          </div>
          <div>
            <Label htmlFor="max-extension-count">Maksimal Perpanjangan (kali)</Label>
            <Input id="max-extension-count" type="number" value={settings.max_extension_count} onChange={handleChange} min={0} />
          </div>
          <div>
            <Label htmlFor="fine-per-day">Denda Per Hari (Rp)</Label>
            <Input id="fine-per-day" type="number" value={settings.fine_per_day} onChange={handleChange} min={0} step={100} />
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;