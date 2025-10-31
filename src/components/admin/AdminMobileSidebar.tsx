import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Book,
  List,
  Users,
  RotateCcw,
  BookOpen,
  FileText,
  Activity,
  Settings,
  LogOut,
  LibraryBig,
  FileSpreadsheet,
  DollarSign, // Added DollarSign icon for Fine Management
} from 'lucide-react';
import GSAPButton from '@/components/GSAPButton'; // Menggunakan GSAPButton
import { cn } from '@/lib/utils';

interface AdminMobileSidebarProps {
  onLogout: () => void;
  onLinkClick?: () => void; // Optional prop to close sidebar on link click
}

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/books', icon: Book, label: 'Buku' },
  { path: '/admin/categories', icon: List, label: 'Kategori' },
  { path: '/admin/students', icon: Users, label: 'Siswa' },
  { path: '/admin/circulation', icon: RotateCcw, label: 'Sirkulasi' },
  { path: '/admin/visitor-management', icon: BookOpen, label: 'Manajemen Pengunjung' },
  { path: '/admin/fines', icon: DollarSign, label: 'Manajemen Denda' }, // New: Fine Management
  { path: '/admin/reports', icon: FileText, label: 'Laporan' },
  { path: '/admin/export', icon: FileSpreadsheet, label: 'Export Laporan' },
  { path: '/admin/log', icon: Activity, label: 'Log' },
  { path: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

const AdminMobileSidebar: React.FC<AdminMobileSidebarProps> = ({ onLogout, onLinkClick }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex items-center">
        <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8 mr-2" />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
            className={cn(
              'flex items-center p-3 rounded-lg text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200',
              location.pathname.startsWith(item.path) && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <GSAPButton
          onClick={() => {
            onLogout();
            onLinkClick?.(); // Close sidebar after logout
          }}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </GSAPButton>
      </div>
    </div>
  );
};

export default AdminMobileSidebar;