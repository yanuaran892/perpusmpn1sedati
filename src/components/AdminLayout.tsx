import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Menu,
  UserCircle,
  Loader2,
  DollarSign, // Added DollarSign icon for Fine Management
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'; // Import SheetHeader, SheetTitle, SheetDescription
import AdminMobileSidebar from '@/components/admin/AdminMobileSidebar';
import { VisuallyHidden } from '@/components/ui/visually-hidden'; // Import VisuallyHidden

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

const AdminLayout = () => {
  const { admin, logout, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-700">Memuat...</p>
      </div>
    );
  }

  if (!admin) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
          <div className="p-4 border-b flex items-center justify-center h-16">
            <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8 mr-2" />
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          </div>
          <nav className="flex-grow p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
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
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <UserCircle className="h-6 w-6 mr-2 text-gray-600" />
              <span className="font-medium text-gray-800">{admin.username}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header / Top Nav */}
        {isMobile && (
          <header className="bg-white shadow-md p-4 flex items-center justify-between h-16">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader>
                  <VisuallyHidden>
                    <SheetTitle>Navigasi Admin</SheetTitle>
                    <SheetDescription>Tautan navigasi untuk panel admin.</SheetDescription>
                  </VisuallyHidden>
                </SheetHeader>
                <AdminMobileSidebar onLogout={handleLogout} onLinkClick={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8 mr-2" />
              <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
            </Button>
          </header>
        )}

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet /> {/* Renders the child routes */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;