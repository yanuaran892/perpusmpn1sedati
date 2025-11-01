import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail, Twitter, Phone } from 'lucide-react';

interface NavLink {
  id: string;
  label: string;
}

interface LandingFooterProps {
  onScrollToSection: (id: string) => void;
  navLinks: NavLink[];
}

const LandingFooter: React.FC<LandingFooterProps> = ({ onScrollToSection, navLinks }) => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-start">
        <div>
          <div className="flex items-center mb-6">
            <img src="/smpn1sedati_logo.png" alt="Logo" className="h-14 w-14 mr-4" />
            <div>
              <p className="font-bold text-xl">SMP NEGERI 1</p>
              <p className="font-bold text-2xl text-primary">SEDATI</p>
            </div>
          </div>
          <p className="font-semibold text-lg mb-3">Alamat Perpustakaan</p>
          <p className="text-gray-400 leading-relaxed">Jl. Brantas No. 1, Jalan Juanda, Jl. Raya Bandara Juanda, Kepuh, Betro, Kec. Sedati, Kabupaten Sidoarjo, Jawa Timur 61253</p>
          <div className="flex gap-6 mt-6">
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={24} /></a>
            <a href="#" aria-label="Youtube" className="text-gray-400 hover:text-red-500 transition-colors"><Youtube size={24} /></a>
            <a href="#" aria-label="Email" className="text-gray-400 hover:text-blue-400 transition-colors"><Mail size={24} /></a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-300 transition-colors"><Twitter size={24} /></a>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="font-semibold text-lg mb-3">Kontak Cepat</p>
            <div className="flex items-center mb-2"><Phone size={20} className="mr-3 text-primary" /><p className="text-gray-300">031-8667427</p></div>
            <div className="flex items-center"><Mail size={20} className="mr-3 text-primary" /><p className="text-gray-300">perpustakaan@smpn1sedati.sch.id</p></div>
          </div>
          <div>
            <p className="font-semibold text-lg mb-3">Tautan Cepat</p>
            <ul className="space-y-2">
              <li><button onClick={() => onScrollToSection('about')} className="text-gray-400 hover:text-white transition-colors">Tentang Kami</button></li>
              <li><button onClick={() => onScrollToSection('gallery')} className="text-gray-400 hover:text-white transition-colors">Galeri</button></li>
              <li><button onClick={() => onScrollToSection('information')} className="text-gray-400 hover:text-white transition-colors">Informasi</button></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Masuk Siswa</Link></li>
              <li><Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">Masuk Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center border-t border-gray-700 mt-16 pt-8 px-4">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Perpustakaan SMPN 1 Sedati. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;