import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, BookOpen, Users, Award, Mail, Phone, MapPin, Instagram, Youtube, Menu, X } from 'lucide-react';
import GSAPButton from '@/components/GSAPButton';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'features', 'gallery', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu when a section is selected
  };

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'about', label: 'Tentang' },
    { id: 'features', label: 'Fitur' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'contact', label: 'Kontak' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/smpn1sedati_logo.png" 
                alt="Logo SMPN 1 Sedati" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Perpustakaan Digital</h1>
                <p className="text-xs text-gray-600">SMPN 1 Sedati</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:block">
              <Link to="/login">
                <GSAPButton className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full px-6 py-2.5 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                  Masuk Siswa
                </GSAPButton>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Link to="/login" className="block">
                  <GSAPButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full px-6 py-2.5 font-semibold shadow-lg transition-all duration-300">
                    Masuk Siswa
                  </GSAPButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20"></div>
          <img 
            src="/foto (3).png" 
            alt="Perpustakaan" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/smpn1sedati_logo.png" 
                alt="Logo Sekolah" 
                className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Jelajahi Dunia Ilmu
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
              Perpustakaan digital SMPN 1 Sedati dengan koleksi ribuan buku dan sumber belajar
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <GSAPButton className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105">
                  Mulai Jelajahi
                </GSAPButton>
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors"
              >
                Pelajari Lebih Lanjut
                <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tentang Perpustakaan Kami
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Perpustakaan SMPN 1 Sedati merupakan pusat informasi dan pembelajaran yang menyediakan 
                berbagai koleksi buku, jurnal, dan sumber daya digital untuk mendukung proses belajar 
                mengajar dan meningkatkan minat baca siswa.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm">
                  <BookOpen className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">10,000+</h3>
                  <p className="text-gray-600">Buku Tersedia</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm">
                  <Users className="h-10 w-10 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">1,200+</h3>
                  <p className="text-gray-600">Pengguna Aktif</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/foto (1).jpg" 
                  alt="Perpustakaan" 
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl flex items-center justify-center">
                <Award className="h-16 w-16 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fitur Unggulan Kami
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Pengalaman perpustakaan modern yang memudahkan akses informasi dan pembelajaran
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10" />,
                title: "Koleksi Digital",
                description: "Ribuan buku dan jurnal digital yang dapat diakses kapan saja"
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Ruang Diskusi",
                description: "Fasilitas kolaborasi untuk belajar kelompok dan diskusi"
              },
              {
                icon: <Award className="h-10 w-10" />,
                title: "Program Literasi",
                description: "Berbagai program untuk meningkatkan minat baca siswa"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Galeri Perpustakaan
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Suasana dan fasilitas perpustakaan kami yang nyaman dan modern
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "/foto (1).jpg",
              "/foto (2).png",
              "/foto (3).jpg",
              "/public/hero_landing.png",
              "/foto (2).jpg",
              "/foto (1).png"
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img 
                  src={image} 
                  alt={`Galeri ${index + 1}`} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <h3 className="text-white text-xl font-bold">Suasana Perpustakaan</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Hubungi Kami
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Punya pertanyaan? Jangan ragu untuk menghubungi kami
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Alamat</h4>
                      <p className="opacity-90">Jl. Brantas No. 1, Jalan Juanda, Jl. Raya Bandara Juanda, Kepuh, Betro, Kec. Sedati, Kabupaten Sidoarjo, Jawa Timur 61253</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-6 w-6 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Telepon</h4>
                      <p className="opacity-90">031-8667427</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Email</h4>
                      <p className="opacity-90">perpustakaan@smpn1sedati.sch.id</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-8">
                  <a href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                    <Youtube className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan email Anda"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tulis pesan Anda"
                  ></textarea>
                </div>
                <GSAPButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl px-6 py-3 font-semibold shadow-lg transition-all duration-300">
                  Kirim Pesan
                </GSAPButton>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/smpn1sedati_logo.png" 
                  alt="Logo SMPN 1 Sedati" 
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <h3 className="text-2xl font-bold">Perpustakaan Digital</h3>
                  <p className="text-blue-200">SMPN 1 Sedati</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Mendorong minat baca dan literasi digital di kalangan siswa melalui koleksi dan fasilitas perpustakaan yang modern.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Tautan Cepat</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-white transition-colors">Beranda</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white transition-colors">Tentang</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">Fitur</button></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Masuk Siswa</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Kontak</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Jl. Brantas No. 1, Sedati</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>031-8667427</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>perpustakaan@smpn1sedati.sch.id</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Perpustakaan Digital SMPN 1 Sedati. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;