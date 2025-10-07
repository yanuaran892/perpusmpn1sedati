import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface MonthlyBorrowData {
  month: string;
  borrows: number;
}

const MonthlyBorrowChart: React.FC = () => {
  const [data, setData] = useState<MonthlyBorrowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyBorrows();
  }, []);

  const fetchMonthlyBorrows = async () => {
    setLoading(true);
    try {
      const { data: circulationData, error } = await supabase
        .from('sirkulasi')
        .select('tanggal_pinjam, status')
        .eq('status', 'dipinjam'); // Only count 'dipinjam' status

      if (error) {
        showError(error.message || 'Gagal mengambil data peminjaman bulanan.');
        setData([]);
        return;
      }

      if (circulationData) {
        const monthlyCounts: { [key: string]: number } = {};

        circulationData.forEach(item => {
          const date = parseISO(item.tanggal_pinjam);
          const monthYear = format(date, 'MMM yyyy', { locale: id }); // e.g., "Jan 2023"
          monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
        });

        // Sort data by date
        const sortedData = Object.keys(monthlyCounts)
          .map(month => ({ month, borrows: monthlyCounts[month] }))
          .sort((a, b) => {
            const dateA = parseISO(a.month.replace(' ', '-01-')); // Convert "Jan 2023" to "2023-01-01" for parsing
            const dateB = parseISO(b.month.replace(' ', '-01-'));
            return dateA.getTime() - dateB.getTime();
          });

        setData(sortedData);
      }
    } catch (err) {
      console.error('Error fetching monthly borrows:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data peminjaman bulanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Peminjaman Buku Bulanan</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : data.length === 0 ? (
          <p className="text-gray-600">Tidak ada data peminjaman untuk ditampilkan.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#1F2937' }}
              />
              <Bar dataKey="borrows" fill="hsl(var(--primary))" name="Jumlah Peminjaman" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyBorrowChart;