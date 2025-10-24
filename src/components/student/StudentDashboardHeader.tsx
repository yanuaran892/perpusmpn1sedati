import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LibraryBig, User, LogOut, Search, Book, LayoutGrid, BookOpen, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedStatCard from '@/components/AnimatedStatCard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudentDashboardHeaderProps {
  studentName: string;
  onLogout: () => void;
  onProfileClick: () => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalBooksCount: number;
  totalCategoriesCount: number;
}

const StudentDashboardHeader: React.FC<StudentDashboardHeaderProps> = ({
  studentName,
  onLogout,
  onProfileClick,
  searchTerm,
  onSearchChange,
  totalBooksCount,
  totalCategoriesCount,
}) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
  };

  const searchBarVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="relative bg-gradient-to-r from-primary to-indigo-700 text-white p-4 md:p-8 shadow-lg pb-20 md:pb-24" // Increased padding-bottom to make space for content below
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <LibraryBig className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3" />
            <h1 className="text-xl md:text-2xl font-bold">PERPUS SMPN 1 SEDATI</h1>
          </div>

          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-4 bg-white text-gray-800">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center mb-4">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg text-primary">{studentName}</span>
                  </div>
                  <Button onClick={() => { onProfileClick(); setIsSheetOpen(false); }} variant="ghost" className="w-full justify-start text-primary hover:bg-primary/5">
                    <User className="mr-2 h-5 w-5" /> Profil Siswa
                  </Button>
                  <Button onClick={() => { onLogout(); setIsSheetOpen(false); }} variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <Button onClick={onProfileClick} variant="ghost" className="text-white hover:bg-blue-700 transition-colors duration-300">
                <User className="mr-2 h-5 w-5" /> Profil Siswa
              </Button>
              <Button onClick={onLogout} variant="ghost" className="text-white hover:bg-blue-700 transition-colors duration-300">
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm mb-8 opacity-90">© Copyright {new Date().getFullYear()} SMPN 1 SEDATI</p>

        {/* Hero Content */}
        <div className="flex justify-center mb-10">
          <motion.img
            src="/smpn1sedati_logo.png"
            alt="Logo Sekolah"
            className="h-28 w-28 object-contain animate-pulse"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </div>

        <motion.div variants={heroTextVariants} className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">Jelajahi Koleksi Buku Kami</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            Temukan buku favorit Anda dari berbagai kategori dan tingkatkan pengetahuan Anda.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={searchBarVariants} className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Cari buku berdasarkan judul..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-800 border-none rounded-full shadow-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-lg"
            />
          </div>
        </motion.div>
      </div>

      {/* Stat Cards (positioned absolutely to overlap with content below) */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <AnimatedStatCard icon={Book} label="Total Buku" value={totalBooksCount} animationDelay={0.3} />
          <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={totalCategoriesCount} animationDelay={0.4} />
          <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.5} />
        </div>
      </div>
    </motion.header>
  );
};

export default StudentDashboardHeader;