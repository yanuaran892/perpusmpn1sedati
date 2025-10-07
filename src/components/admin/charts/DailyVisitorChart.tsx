import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format, parse } from 'date-fns'; // Changed parseISO to parse
import { id } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface DailyVisitorData {
  date: string;
  visitors: number;
}

const DailyVisitorChart: React.FC = () => {
  const [data, setData] = useState<DailyVisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyVisitors();
  }, []);

  const fetchDailyVisitors = async () => {
    setLoading(true);
    try {
      const { data: guestBookData, error } = await supabase
        .from('buku_tamu')
        .select('tanggal');

      if (error) {
        showError(error.message || 'Gagal mengambil data pengunjung harian.');
        setData([]);
        return;
      }

      if (guestBookData) {
        const dailyCounts: { [key: string]: number } = {};

        guestBookData.forEach(entry => {
          const date = parse(entry.tanggal, 'yyyy-MM-dd', new Date()); // Parse the date string correctly
          const formattedDate = format(date, 'dd MMM', { locale: id }); // e.g., "01 Jan"
          dailyCounts[formattedDate] = (dailyCounts[formattedDate] || 0) + 1;
        });

        // Sort data by date
        const sortedData = Object.keys(dailyCounts)
          .map(date => ({ date, visitors: dailyCounts[date] }))
          .sort((a, b) => {
            // Reconstruct date for proper sorting (assuming current year for simplicity)
            const year = new Date().getFullYear();
            const dateA = parse(`${a.date} ${year}`, 'dd MMM yyyy', new Date()); // Use parse
            const dateB = parse(`${b.date} ${year}`, 'dd MMM yyyy', new Date()); // Use parse
            return dateA.getTime() - dateB.getTime();
          });

        setData(sortedData);
      }
    } catch (err) {
      console.error('Error fetching daily visitors:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data pengunjung harian.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Pengunjung Harian</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : data.length === 0 ? (
          <p className="text-gray-600">Tidak ada data pengunjung untuk ditampilkan.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#1F2937' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" name="Jumlah Pengunjung" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyVisitorChart;