import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

const CategoryDistributionChart: React.FC = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDistribution();
  }, []);

  const fetchCategoryDistribution = async () => {
    setLoading(true);
    try {
      const { data: booksData, error: booksError } = await supabase
        .from('buku')
        .select('id_kategori');

      if (booksError) {
        showError(booksError.message || 'Gagal mengambil data buku untuk distribusi kategori.');
        setData([]);
        return;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('kategori')
        .select('id_kategori, nama_kategori, warna');

      if (categoriesError) {
        showError(categoriesError.message || 'Gagal mengambil data kategori.');
        setData([]);
        return;
      }

      if (booksData && categoriesData) {
        const categoryCounts: { [key: number]: number } = {};
        booksData.forEach(book => {
          if (book.id_kategori) {
            categoryCounts[book.id_kategori] = (categoryCounts[book.id_kategori] || 0) + 1;
          }
        });

        const chartData: CategoryData[] = categoriesData.map((category, index) => ({
          name: category.nama_kategori,
          value: categoryCounts[category.id_kategori] || 0,
          color: category.warna || COLORS[index % COLORS.length],
        }));

        setData(chartData.filter(item => item.value > 0)); // Only show categories with books
      }
    } catch (err) {
      console.error('Error fetching category distribution:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil data distribusi kategori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Distribusi Buku per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : data.length === 0 ? (
          <p className="text-gray-600">Tidak ada data kategori untuk ditampilkan.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#1F2937' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryDistributionChart;