import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Phone, Mail, Instagram, Youtube, Twitter, Menu, Book, LayoutGrid, BookOpen, UserCircle, Image as ImageIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import AnimatedStatCard from "@/components/AnimatedStatCard";
import LandingPageCard from "@/components/LandingPageCard";
import GSAPButton from "@/components/GSAPButton";
import LibrarianCarousel from "@/components/LibrarianCarousel"; // Import the new carousel component

const LandingPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroBackgroundParallax = useTransform(scrollY, [0, 500], [0, -100]); // Parallax for hero background

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsSheetOpen(false);
  };

  const navLinks = [
    { id: 'about', label: 'Tentang' },
    { id: 'librarians', label: 'Pustakawan' },
    { id: 'gallery', label: 'Galeri' }, // New: Gallery link
    { id: 'information', label: 'Informasi' },
    { id: 'contact', label: 'Kontak' },
  ];

  const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode, id: string, className?: string }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    return (
      <motion.section
        id={id}
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`container mx-auto py-16 md:py-24 ${className}`} // Removed px-4 here
      >
        {children}
      </motion.section>
    );
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 1, 0.2, 1] } },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.2, 1, 0.2, 1] } },
  };

  // Data for librarians
  const librariansData = [
    { name: "Bapak Budi Santoso", title: "Pustakawan Senior", image: "/foto (1).png" },
    { name: "Ibu Ani Wijaya", title: "Pustakawan Digital", image: "/foto (2).png" },
    { name: "Bapak Cahyo Nugroho", title: "Pustakawan Koleksi", image: "/foto (3).png" },
    { name: "Ibu Dewi Lestari", title: "Pustakawan Anak", image: "/foto (1).png" }, // Reusing images
    { name: "Bapak Eko Prasetyo", title: "Pustakawan Arsip", image: "/foto (2).png" }, // Reusing images
    { name: "Ibu Fitri Handayani", title: "Pustakawan Referensi", image: "/foto (3).png" }, // Reusing images
  ];

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 flex items-center bg-gradient-to-r from-gray-900/80 to-blue-950/80 backdrop-blur-md shadow-xl border-b border-white/10 transition-colors duration-300 py-3">
        <div className="flex justify-between items-center w-full px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-white font-extrabold text-xl tracking-wide">
            <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">SMPN 1 SEDATI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-white">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent transition-colors font-medium">Beranda</button>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => handleScrollToSection(link.id)} className="hover:text-accent transition-colors font-medium">{link.label}</button>
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
                    {navLinks.map(link => (<button key={link.id} onClick={() => handleScrollToSection(link.id)} className="text-left py-2 hover:text-accent transition-colors">{link.label}</button>))}
                  </nav>
                  <div className="mt-auto"><Link to="/login"><GSAPButton className="w-full bg-accent hover:bg-accent/90 text-white rounded-full px-6 btn-shiny">Masuk</GSAPButton></Link></div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="pt-16"> {/* Now that box-sizing is border-box, h-16 (4rem) is the correct height */}
        {/* Hero Section */}
        <section
          id="home"
          className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center" // Adjusted min-h to match header height
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/foto (3).png')", 
            }}
          ></motion.div>
          {/* Overlay hitam transparan */}
          <div className="absolute inset-0 bg-black/40"></div> 
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center w-full px-4"> {/* Added w-full px-4 here */}
            <motion.img src="/smpn1sedati_logo.png" alt="Logo SMPN 1 Sedati" className="h-28 w-28 md:h-40 md:w-40 mb-6 drop-shadow-lg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }} />
            <motion.h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider drop-shadow-lg leading-tight mb-4 font-guncen" initial="hidden" animate="visible" variants={textVariants}>PERPUSTAKAAN</motion.h1>
            <motion.h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-8 leading-tight font-guncen" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.2 }}>SMP NEGERI 1 SEDATI</motion.h2>
            <motion.p className="text-lg md:text-xl italic max-w-md drop-shadow-lg mb-10 font-ccspaghettiwestern" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.4 }}>"Kalau engkau hanya membaca buku yang dibaca semua orang, engkau hanya bisa berpikir sama seperti semua orang."<br />(Haruki Murakami).</motion.p> {/* Removed px-4, changed max-w-sm to max-w-md */}
            <motion.div initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.6 }}>
              <Link to="/login"><GSAPButton className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-4 text-xl font-semibold shadow-xl transition-all duration-300 transform hover:scale-105">Mulai Jelajahi</GSAPButton></Link>
            </motion.div>
          </div>
        </section>

        {/* Tentang Section */}
        <AboutSection />

        {/* Pustakawan Section */}
        <SectionWrapper id="librarians" className="bg-gradient-to-b from-gray-100 to-gray-200"> {/* Removed container mx-auto */}
          <motion.h3
            className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            TIM PUSTAKAWAN KAMI
          </motion.h3>
          <div className="max-w-6xl mx-auto overflow-x-hidden"> {/* Added overflow-x-hidden here */}
            <LibrarianCarousel librarians={librariansData} />
          </div>
        </SectionWrapper>

        {/* New: Galeri Perpustakaan Section */}
        <GallerySection />

        {/* Informasi Section - Updated to use ModernInfoCard */}
        <SectionWrapper id="information" className="relative bg-gradient-to-br from-gray-900 to-blue-950 text-white overflow-hidden"> {/* Removed container mx-auto */}
          {/* Background elements for visual interest */}
          <div className="absolute inset-[-50px] z-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-3"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-16 drop-shadow-lg font-guncen">INFORMASI PENTING</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Card 1: Waktu Pelayanan */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1], delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-primary transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <div className="p-4 rounded-full bg-primary/20 text-primary-foreground mr-4">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h4 className="text-3xl font-bold text-white">Waktu Pelayanan</h4>
                </div>
                <p className="text-lg text-gray-200 leading-relaxed">
                  Perpustakaan kami melayani dari **Senin hingga Sabtu**, mulai pukul **07.00 hingga 16.00 WIB**. Waktu ini disesuaikan dengan jadwal kegiatan sekolah untuk memastikan aksesibilitas maksimal bagi seluruh siswa dan staf.
                </p>
              </motion.div>

              {/* Card 2: Tata Cara Peminjaman */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1], delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-accent transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <div className="p-4 rounded-full bg-accent/20 text-accent-foreground mr-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className="text-3xl font-bold text-white">Tata Cara Peminjaman</h4>
                </div>
                <ul className="text-lg text-gray-200 leading-relaxed space-y-3 list-disc pl-5">
                  <li>**Login** ke akun siswa Anda.</li>
                  <li>Maksimal **2 buku** untuk siswa dan **5 buku** untuk guru.</li>
                  <li>Masa peminjaman **7 hari**, dengan **1 kali perpanjangan** yang harus disetujui admin.</li>
                  <li>Denda keterlambatan **Rp500 per hari**.</li>
                  <li>Buku yang rusak atau hilang wajib diganti.</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>

        {/* Contact Section */}
        <SectionWrapper id="contact" className="relative bg-gradient-to-br from-blue-900 to-indigo-950 text-white overflow-hidden"> {/* Removed container mx-auto */}
          {/* Background blobs for visual interest */}
          <div className="absolute inset-[-50px] z-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl animate-blob-3"></div>
          </div>

          <div className="relative z-10 text-center">
            <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-6 drop-shadow-lg font-guncen">HUBUNGI KAMI</h3>
            <p className="text-lg text-gray-300 text-center mb-16 max-w-3xl mx-auto">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui informasi di bawah ini atau kirimkan pesan langsung.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Phone Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 1, 0.2, 1] }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-primary transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center"
              >
                <div className="p-5 rounded-full bg-primary/20 text-primary-foreground mb-6">
                  <Phone className="h-10 w-10" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">Telepon / WhatsApp</h4>
                <p className="text-xl text-gray-200 mb-6">031-8667427</p>
                <a href="tel:+62318667427" className="w-full">
                  <GSAPButton variant="default" className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold rounded-full shadow-md">
                    <Phone className="mr-2 h-5 w-5" /> Telepon Sekarang
                  </GSAPButton>
                </a>
              </motion.div>

              {/* Email Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.2, 1, 0.2, 1] }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-accent transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center"
              >
                <div className="p-5 rounded-full bg-accent/20 text-accent-foreground mb-6">
                  <Mail className="h-10 w-10" />
                </div>
                <h4 className="2xl font-bold text-white mb-3">Email</h4>
                <p className="text-xl text-gray-200 mb-6">perpustakaan@smpn1sedati.sch.id</p>
                <a href="mailto:perpustakaan@smpn1sedati.sch.id" className="w-full">
                  <GSAPButton variant="default" className="w-full bg-accent hover:bg-accent/90 text-white py-3 text-lg font-semibold rounded-full shadow-md">
                    <Mail className="mr-2 h-5 w-5" /> Kirim Email
                  </GSAPButton>
                </a>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto grid md:grid-cols-3 gap-12 items-start">
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
                <li><button onClick={() => handleScrollToSection('about')} className="text-gray-400 hover:text-white transition-colors">Tentang Kami</button></li>
                <li><button onClick={() => handleScrollToSection('gallery')} className="text-gray-400 hover:text-white transition-colors">Galeri</button></li>
                <li><button onClick={() => handleScrollToSection('information')} className="text-gray-400 hover:text-white transition-colors">Informasi</button></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Masuk Siswa</Link></li>
                <li><Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">Masuk Admin</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container mx-auto text-center border-t border-gray-700 mt-16 pt-8"><p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Perpustakaan SMPN 1 Sedati. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

// New component for the redesigned About Section
const AboutSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section
      id="about"
      ref={ref}
      className="container mx-auto py-16 md:py-24 px-4 bg-gradient-to-b from-white to-blue-50 overflow-hidden relative bg-[url('/subtle-dots.svg')] bg-repeat" // Added subtle-dots background
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text Content */}
        <div className=""> {/* Removed space-y-6 */}
          <motion.p
            className="text-lg font-semibold text-primary tracking-wider uppercase mb-2" // Added mb-2
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Selamat Datang di
          </motion.p>
          <motion.h3
            className="text-4xl md:text-5xl font-extrabold text-gray-900 font-guncen leading-tight mb-4"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            Perpustakaan SMPN 1 SEDATI
          </motion.h3>
          <motion.div
            className="w-24 h-1.5 bg-accent rounded-full mb-8" // Increased mb-6 to mb-8
            initial={{ width: 0 }}
            animate={inView ? { width: '6rem' } : {}}
            transition={{ duration: 1, delay: 0.5, ease: [0.2, 1, 0.2, 1] }}
          />
          <motion.p
            className="text-lg text-gray-700 leading-relaxed" // Removed mt-4
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
          >
            Halo, Sobat Literasi! Perpustakaan kami hadir sebagai pusat belajar dan sumber inspirasi. Temukan berbagai koleksi buku, majalah, dan referensi pembelajaran untuk memperluas wawasan dan meningkatkan prestasi Anda.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
          >
            <Link to="/login">
              <GSAPButton className="mt-8 bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                Lihat Koleksi
              </GSAPButton>
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Image */}
        <motion.div
          className="relative h-full flex items-center justify-center min-h-[400px] overflow-hidden rounded-2xl p-4 bg-white shadow-2xl" // Added padding, white background, and shadow to the image container
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.2, 1, 0.2, 1] }}
        >
          {/* Decorative background elements, slightly larger and rotated, clipped by parent's overflow-hidden */}
          <div className="absolute inset-[-10%] bg-blue-200 rounded-3xl transform -rotate-6 z-0"></div>
          <div className="absolute inset-[-10%] bg-accent/20 rounded-3xl transform rotate-6 z-0"></div>
          <img
            src="/foto (1).jpg"
            alt="Suasana Perpustakaan"
            className="relative w-full h-auto object-cover rounded-xl shadow-xl z-10" // Adjusted rounded-xl and shadow
          />
        </motion.div>
      </div>
    </section>
  );
};

// New component for Gallery Section
const GallerySection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const galleryImages = [
    { src: "/foto (1).jpg", alt: "Interior Perpustakaan", title: "Sudut Baca Nyaman", description: "Area yang tenang untuk fokus belajar dan membaca." },
    { src: "/foto (2).png", alt: "Rak Buku Modern", title: "Koleksi Buku Lengkap", description: "Ribuan judul buku dari berbagai genre dan kategori." },
    { src: "/foto (3).jpg", alt: "Area Baca Nyaman", title: "Fasilitas Modern", description: "Meja dan kursi ergonomis untuk kenyamanan maksimal." },
    { src: "/public/hero_landing.png", alt: "Siswa Membaca", title: "Siswa Berliterasi", description: "Mendorong minat baca dan budaya literasi di sekolah." },
  ];

  return (
    <section id="gallery" ref={ref} className="container mx-auto py-16 md:py-24 px-4"> {/* Applied container mx-auto px-4 directly */}
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">GALERI PERPUSTAKAAN</h3>
      <p className="text-lg text-gray-700 text-center mb-16 max-w-3xl mx-auto">
        Jelajahi suasana dan fasilitas perpustakaan kami melalui koleksi foto-foto inspiratif ini.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-4xl mx-auto"> {/* Adjusted grid for 4 items */}
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.08 }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h4 className="text-white text-xl font-bold mb-2">{image.title}</h4>
                <p className="text-gray-200 text-sm">{image.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-16">
          <GSAPButton variant="outline" className="bg-primary text-white hover:bg-primary/90 px-8 py-3 text-lg shadow-md">
            <ImageIcon className="mr-2 h-5 w-5" /> Lihat Lebih Banyak Foto
          </GSAPButton>
        </div>
    </section>
  );
};

export default LandingPage;