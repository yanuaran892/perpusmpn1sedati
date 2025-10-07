import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // For Indonesian date formatting

interface AdminLogEntry {
  id: number;
  admin_id: number | null;
  admin_username: string;
  action_type: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminLogPage = () => {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    fetchAdminLogs();
  }, [searchTerm, filterStatus, currentPage]);

  const fetchAdminLogs = async () => {
    setLoading(true);
    try {
      // Call the new RPC function to fetch logs
      const { data, error } = await supabase.rpc('get_admin_logs', {
        searchkey: searchTerm,
        filter_status: filterStatus,
        limit_value: logsPerPage,
        offset_value: (currentPage - 1) * logsPerPage,
      });

      // To get the total count for pagination, we need a separate RPC or adjust the existing one
      // For simplicity, let's assume the RPC returns all filtered data and we paginate client-side for now,
      // or create a separate RPC for count.
      // Given the RPC now has limit/offset, we need a separate count RPC.

      const { count, error: countError } = await supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
        .or(`admin_username.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,action_type.ilike.%${searchTerm}%`)
        .eq(filterStatus !== 'all' ? 'status' : '1', filterStatus !== 'all' ? filterStatus : '1'); // Conditional filter

      if (error) {
        showError(error.message || 'Gagal mengambil log aktivitas.');
        setLogs([]);
        setTotalPages(1);
        return;
      }

      if (data) {
        setLogs(data);
        setTotalPages(Math.max(1, Math.ceil((count || 0) / logsPerPage)));
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err);
      showError('Terjadi kesalahan tak terduga saat mengambil log aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas</h1>
      <p className="text-gray-600">Pantau semua aktivitas yang terjadi di sistem admin.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Daftar Log</CardTitle>
          <CardDescription>Catatan aktivitas terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan pengguna, aksi, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setFilterStatus} value={filterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="SUCCESS">Sukses</SelectItem>
                <SelectItem value="FAILED">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-gray-700">Memuat log aktivitas...</p>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">Tidak ada log aktivitas ditemukan.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Jenis Aksi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss', { locale: id })}</TableCell>
                      <TableCell>{log.admin_username}</TableCell>
                      <TableCell>{log.action_type}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'SUCCESS' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status === 'SUCCESS' ? 'Sukses' : 'Gagal'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogPage;