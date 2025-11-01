import React from 'react';
import { Link } from 'react-router-dom';
import GSAPButton from '@/components/GSAPButton';
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
      // Increased padding-bottom significantly to ensure stat cards are fully visible
      className="relative w-full min-h-[70vh] md:min-h-[80vh] bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden flex flex-col justify-between pb-48 md:pb-64 shadow-2xl" // Adjusted pb-56 to pb-48 and pb-72 to pb-64
    >
      {/* Background Blobs and Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('/subtle-dots.svg')] bg-repeat">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col flex-grow">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <LibraryBig className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3 drop-shadow-md" />
            <h1 className="text-xl md:text-2xl font-bold drop-shadow-md">PERPUS SMPN 1 SEDATI</h1>
          </div>

          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <GSAPButton variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="h-6 w-6" />
                </GSAPButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-4 bg-white text-gray-800">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center mb-4">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg text-primary">{studentName}</span>
                  </div>
                  <GSAPButton onClick={() => { onProfileClick(); setIsSheetOpen(false); }} variant="ghost" className="w-full justify-start text-primary hover:bg-primary/5">
                    <User className="mr-2 h-5 w-5" /> Profil Siswa
                  </GSAPButton>
                  <GSAPButton onClick={() => { onLogout(); setIsSheetOpen(false); }} variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                  </GSAPButton>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <GSAPButton onClick={onProfileClick} variant="ghost" className="text-white hover:bg-white/20 transition-colors duration-300">
                <User className="mr-2 h-5 w-5" /> Profil Siswa
              </GSAPButton>
              <GSAPButton onClick={onLogout} variant="ghost" className="text-white hover:bg-white/20 transition-colors duration-300">
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </GSAPButton>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center flex-grow text-center mb-10">
          <motion.img
            src="/smpn1sedati_logo.png"
            alt="Logo Sekolah"
            className="h-28 w-28 md:h-36 md:w-36 object-contain animate-pulse drop-shadow-lg mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.h2 variants={heroTextVariants} className="text-4xl md:text-6xl font-extrabold mb-3 font-guncen drop-shadow-lg">
            Selamat Datang, {studentName}!
          </motion.h2>
          <motion.p variants={heroTextVariants} className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto drop-shadow-md" style={{ animationDelay: '0.4s' }}>
            Jelajahi ribuan koleksi buku digital dan fisik kami.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div variants={searchBarVariants} className="flex justify-center mt-auto mb-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Cari buku berdasarkan judul, penulis, atau ISBN..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-800 border-none rounded-full shadow-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-lg"
            />
          </div>
        </motion.div>
      </div>

      {/* Stat Cards - Removed from here as they are now rendered directly in Dashboard.tsx */}
      {/*
      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-7xl mx-auto px-4">
          <AnimatedStatCard icon={Book} label="Total Buku" value={totalBooksCount} animationDelay={0.3} />
          <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={totalCategoriesCount} animationDelay={0.4} />
          <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.5} />
        </div>
      </div>
      */}
    </motion.header>
  );
};

export default StudentDashboardHeader;