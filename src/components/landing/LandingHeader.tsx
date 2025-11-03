import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, LibraryBig } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import GSAPButton from '@/components/GSAPButton';

interface NavLink {
  id: string;
  label: string;
}

interface LandingHeaderProps {
  navLinks: NavLink[];
  onScrollToSection: (id: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
  isScrolled: boolean; // Menambahkan prop isScrolled
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  navLinks,
  onScrollToSection,
  isSheetOpen,
  setIsSheetOpen,
  isScrolled,
}) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full h-16 flex items-center ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-gradient-to-r from-gray-900/80 to-blue-950/80 backdrop-blur-md'} transition-all duration-300 py-3`}>
      <div className="flex justify-between items-center w-full px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-white font-extrabold text-xl tracking-wide">
          <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8" />
          <span className="hidden sm:inline">SMPN 1 SEDATI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-white">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent transition-colors font-medium">Beranda</button>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => onScrollToSection(link.id)} className="hover:text-accent transition-colors font-medium">{link.label}</button>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link to="/login">
            <GSAPButton className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 py-2.5 font-semibold btn-shiny">Masuk</GSAPButton>
          </Link>
        </div>
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Menu className="h-6 w-6" /></Button></SheetTrigger>
            <SheetContent side="right" className="bg-gradient-to-b from-gray-900 to-blue-950 text-white border-l-gray-700 w-[250px] p-0">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8"><img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8" /><span className="font-bold">SMPN 1 SEDATI</span></div>
                <nav className="flex flex-col gap-4 text-lg">
                  <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsSheetOpen(false); }} className="text-left py-2 hover:text-accent transition-colors">Beranda</button>
                  {navLinks.map(link => (<button key={link.id} onClick={() => onScrollToSection(link.id)} className="text-left py-2 hover:text-accent transition-colors">{link.label}</button>))}
                </nav>
                <div className="mt-auto"><Link to="/login"><GSAPButton className="w-full bg-accent hover:bg-accent/90 text-white rounded-full px-6 btn-shiny">Masuk</GSAPButton></Link></div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;