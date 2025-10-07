import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Loader2 } from 'lucide-react';

interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportDescription: string;
  columns: string[];
  data: any[]; // Can be CirculationReportItem[] or other report types
  onDownload: () => void; // Function to trigger download from parent
  isDownloading: boolean;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  isOpen,
  onClose,
  reportTitle,
  reportDescription,
  columns,
  data,
  onDownload,
  isDownloading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{reportTitle}</DialogTitle>
          <DialogDescription>{reportDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          {data.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">Tidak ada data untuk ditampilkan dalam laporan ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableHead key={index}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex}>{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={onDownload} disabled={isDownloading || data.length === 0}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Unduh Laporan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;