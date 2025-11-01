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
        className={`py-16 md:py-24 px-4 container mx-auto ${className}`}
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

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 flex items-center bg-gray-800/80 backdrop-blur-sm shadow-lg transition-colors duration-300">
        <div className="flex justify-between items-center w-full px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-white font-bold">
            <img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">SMPN 1 SEDATI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-white">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-300 transition-colors">Beranda</button>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => handleScrollToSection(link.id)} className="hover:text-blue-300 transition-colors">{link.label}</button>
            ))}
          </nav>
          <div className="hidden md:block">
            <Link to="/login">
              <GSAPButton className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Masuk</GSAPButton>
            </Link>
          </div>
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/20"><Menu className="h-6 w-6" /></Button></SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 text-white border-l-gray-700 w-[250px] p-0">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-8"><img src="/smpn1sedati_logo.png" alt="Logo" className="h-8 w-8" /><span className="font-bold">SMPN 1 SEDATI</span></div>
                  <nav className="flex flex-col gap-4 text-lg">
                    <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsSheetOpen(false); }} className="text-left py-2 hover:text-blue-300 transition-colors">Beranda</button>
                    {navLinks.map(link => (<button key={link.id} onClick={() => handleScrollToSection(link.id)} className="text-left py-2 hover:text-blue-300 transition-colors">{link.label}</button>))}
                  </nav>
                  <div className="mt-auto"><Link to="/login"><GSAPButton className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Masuk</GSAPButton></Link></div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          id="home"
          className="relative h-screen w-full overflow-hidden flex items-center justify-center"
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/foto (3).png')", // Original image source
            }}
          ></motion.div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 to-indigo-700/70"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
            <motion.img src="/smpn1sedati_logo.png" alt="Logo SMPN 1 Sedati" className="h-28 w-28 md:h-40 md:w-40 mb-6 drop-shadow-lg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }} />
            <motion.h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-wider drop-shadow-lg leading-tight mb-4 font-guncen" initial="hidden" animate="visible" variants={textVariants}>PERPUSTAKAAN</motion.h1>
            <motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-8 leading-tight font-guncen" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.2 }}>SMP NEGERI 1 SEDATI</motion.h2>
            <motion.p className="text-lg md:text-xl italic max-w-xs sm:max-w-md md:max-w-4xl drop-shadow-lg mb-10 font-playfair" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.4 }}>"Kalau engkau hanya membaca buku yang dibaca semua orang, engkau hanya bisa berpikir sama seperti semua orang."<br />(Haruki Murakami).</motion.p>
            <motion.div initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.6 }}>
              <Link to="/login"><GSAPButton className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-4 text-xl font-semibold shadow-xl transition-all duration-300 transform hover:scale-105">Mulai Jelajahi</GSAPButton></Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <SectionWrapper id="stats" className="bg-gradient-to-br from-gray-100 to-white">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">Sekilas Angka</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto">
            <AnimatedStatCard icon={Book} label="Total Buku" value={10000} animationDelay={0} />
            <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={12} animationDelay={0.2} />
            <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.4} />
          </div>
        </SectionWrapper>

        {/* Tentang Section */}
        <SectionWrapper id="about" className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={imageVariants}>
              <img src="/foto (3).png" alt="Perpustakaan Modern" className="w-full h-auto object-cover rounded-xl shadow-2xl" /> {/* Use a relevant library image here */}
            </motion.div>
            <div className="p-6 md:p-8 bg-card rounded-xl shadow-lg border border-gray-100">
              <motion.p className="text-sm tracking-widest text-primary mb-2" initial="hidden" animate="visible" variants={textVariants}>SELAMAT DATANG DI</motion.p>
              <motion.h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-guncen" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.1 }}>Perpustakaan SMPN 1 SEDATI</motion.h3>
              <motion.p className="text-lg font-semibold mb-6 text-gray-700" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.2 }}>Halo, Sobat Literasi!</motion.p>
              <motion.p className="text-gray-600 leading-relaxed" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.3 }}>Perpustakaan SMPN 1 Sedati hadir sebagai pusat belajar dan sumber inspirasi bagi seluruh warga sekolah. Di sini, kamu dapat menemukan berbagai koleksi buku, majalah, e-book, dan referensi pembelajaran yang akan membantumu memperluas wawasan dan meningkatkan prestasi.</motion.p>
            </div>
          </div>
        </SectionWrapper>

        {/* Pustakawan Section */}
        <LibrariansSection />

        {/* New: Galeri Perpustakaan Section */}
        <GallerySection />

        {/* Informasi Section */}
        <SectionWrapper id="information" className="relative bg-gradient-to-br from-primary to-indigo-700 text-white">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 drop-shadow-lg font-guncen">INFORMASI PENTING</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <LandingPageCard
              icon={Calendar}
              title="Waktu Pelayanan"
              description="Senin - Sabtu: 07.00 - 16.00. Mengikuti waktu kegiatan sekolah."
            />
            <LandingPageCard
              icon={BookOpen}
              title="Tata Cara Peminjaman"
              description="Login, pinjam maksimal 2 buku (siswa) / 5 buku (guru) selama 7 hari. Perpanjangan 1x. Denda Rp500/hari. Ganti buku rusak/hilang."
            />
          </div>
        </SectionWrapper>

        {/* Contact Section */}
        <SectionWrapper id="contact" className="bg-white">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">HUBUNGI KAMI</h3>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui informasi di bawah ini.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Phone className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">Telepon / WhatsApp</h4>
                <p className="text-gray-700 text-lg">031-8667427</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-accent">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Mail className="h-12 w-12 text-accent mb-4" />
                <h4 className="text-xl font-semibold mb-2">Email</h4>
                <p className="text-gray-700 text-lg">perpustakaan@smpn1sedati.sch.id</p>
              </CardContent>
            </Card>
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

// Separate component for Librarians Section to use its own useInView hook
const LibrariansSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="librarians" ref={ref} className="py-16 md:py-24 px-4 container mx-auto bg-gray-100">
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">TIM PUSTAKAWAN KAMI</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {["Bapak Budi Santoso", "Ibu Ani Wijaya", "Bapak Cahyo Nugroho", "Ibu Dewi Lestari"].map((name, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md">
              {/* Placeholder for actual image */}
              <UserCircle className="h-24 w-24 text-blue-600/50" />
            </div>
            <p className="font-bold text-xl text-gray-900 mb-1">{name}</p>
            <p className="text-sm text-primary">Pustakawan Senior</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// New component for Gallery Section
const GallerySection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="gallery" ref={ref} className="bg-gray-100 py-16 md:py-24 px-4 container mx-auto">
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">GALERI PERPUSTAKAAN</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          { src: "/foto (1).jpg", alt: "Interior Perpustakaan" },
          { src: "/foto (2).png", alt: "Rak Buku Modern" },
          { src: "/foto (3).jpg", alt: "Area Baca Nyaman" },
          { src: "/placeholder.svg", alt: "Sudut Belajar" }, // Placeholder for more images
        ].map((image, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-lg font-semibold">{image.alt}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingPage;