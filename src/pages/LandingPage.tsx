import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Phone, Mail, Instagram, Youtube, Twitter, Menu, Book, LayoutGrid, BookOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import AnimatedStatCard from "@/components/AnimatedStatCard";
import TestimonialCard from "@/components/TestimonialCard";

const LandingPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, -100]);

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsSheetOpen(false);
  };

  const navLinks = [
    { id: 'about', label: 'Tentang' },
    { id: 'testimonials', label: 'Testimoni' },
    { id: 'librarians', label: 'Pustakawan' },
    { id: 'information', label: 'Informasi' },
  ];

  const testimonials = [
    { quote: "Perpustakaan ini sangat membantu saya menemukan referensi untuk tugas sekolah. Koleksinya lengkap!", author: "Ahmad Dhani", role: "Siswa Kelas IX" },
    { quote: "Sistem online-nya memudahkan saya untuk meminjam buku tanpa harus antri. Sangat efisien!", author: "Budi Doremi", role: "Siswa Kelas VIII" },
    { quote: "Tempatnya nyaman untuk membaca dan belajar. Pustakawannya juga sangat ramah dan membantu.", author: "Cici Paramida", role: "Siswa Kelas VII" },
    { quote: "Sebagai guru, saya sering memanfaatkan koleksi buku di sini untuk materi ajar. Sangat bermanfaat!", author: "Dedi Mizwar", role: "Guru Bahasa Indonesia" },
  ];

  const SectionWrapper = ({ children, id }: { children: React.ReactNode, id: string }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    return (
      <motion.section
        id={id}
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 px-4 container mx-auto"
      >
        {children}
      </motion.section>
    );
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
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Masuk</Button>
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
                  <div className="mt-auto"><Link to="/login"><Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Masuk</Button></Link></div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative h-screen w-full overflow-hidden">
          <motion.div className="absolute inset-0 w-full h-full" style={{ y: heroParallax }}>
            <img src="/hero_landing.png" alt="Perpustakaan SMPN 1 Sedati" className="w-full h-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
            <motion.img src="/smpn1sedati_logo.png" alt="Logo SMPN 1 Sedati" className="h-24 w-24 md:h-32 md:w-32 mb-4 drop-shadow-lg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} />
            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider drop-shadow-lg leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>PERPUSTAKAAN</motion.h1>
            <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-6 leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>SMP NEGERI 1 SEDATI</motion.h2>
            <motion.p className="text-base md:text-lg italic max-w-xs sm:max-w-sm md:max-w-3xl drop-shadow-lg mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>"Kalau engkau hanya membaca buku yang dibaca semua orang, engkau hanya bisa berpikir sama seperti semua orang."<br />(Haruki Murakami).</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Link to="/login"><Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-3 text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">Mari Membaca</Button></Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl">
            <AnimatedStatCard icon={Book} label="Total Buku" value={10000} animationDelay={0} />
            <AnimatedStatCard icon={LayoutGrid} label="Kategori Buku" value={12} animationDelay={0.2} />
            <AnimatedStatCard icon={BookOpen} label="Akses Online" value="24/7" isNumeric={false} animationDelay={0.4} />
          </div>
        </section>

        {/* Testimonials Section */}
        <SectionWrapper id="testimonials">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-12 tracking-widest">APA KATA MEREKA</h3>
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-4">
                    <TestimonialCard {...testimonial} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </SectionWrapper>

        {/* Tentang Section */}
        <section id="about" className="relative py-16 md:py-24 px-4 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/foto (3).jpg')" }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative container mx-auto grid md:grid-cols-2 items-center">
            <div className="md:col-start-2 text-white p-6 md:p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-sm tracking-widest">SELAMAT DATANG DI</p>
              <h3 className="text-3xl md:text-4xl font-bold my-2">Perpustakaan SMPN 1 SEDATI</h3>
              <p className="text-lg font-semibold mb-4">Halo, Sobat Literasi!</p>
              <p className="text-gray-300 leading-relaxed">Perpustakaan SMPN 1 Sedati hadir sebagai pusat belajar dan sumber inspirasi bagi seluruh warga sekolah. Di sini, kamu dapat menemukan berbagai koleksi buku, majalah, e-book, dan referensi pembelajaran yang akan membantumu memperluas wawasan dan meningkatkan prestasi.</p>
            </div>
          </div>
        </section>

        {/* Pustakawan Section */}
        <SectionWrapper id="librarians">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-12 tracking-widest">PUSTAKAWAN</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {["Nama Pustakawan", "Nama Pustakawan", "Nama Pustakawan", "Nama Pustakawan"].map((name, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-32 h-44 md:w-40 md:h-52 bg-gray-200 rounded-2xl shadow-md mb-4"></div>
                  <p className="font-semibold">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Informasi Section */}
        <section id="information" className="relative py-16 md:py-24 px-4 bg-cover bg-center bg-fixed text-white text-center" style={{ backgroundImage: "url('/foto (2).jpg')" }}>
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative z-10 container mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold">WAKTU PELAYANAN PERPUSTAKAAN</h3>
            <h4 className="text-xl md:text-2xl font-semibold mb-4">SMPN 1 SEDATI</h4>
            <p className="text-lg md:text-xl bg-white/20 inline-block px-4 py-2 rounded-md mb-12">Senin - Sabtu : 07.00 - 16.00 <br /> mengikuti waktu kegiatan sekolah</p>
            <h3 className="text-2xl md:text-3xl font-bold">INFORMASI</h3>
            <h4 className="text-xl md:text-2xl font-semibold mb-6">Tata Cara Peminjaman Buku</h4>
            <ul className="list-disc list-inside text-left max-w-3xl mx-auto space-y-2 text-gray-300">
              <li>Login ke Website Perpustakaan SMPN 1 Sedati menggunakan akun yang telah terdaftar.</li>
              <li>Siswa dapat meminjam maksimal 2 buku dan guru maksimal 5 buku dengan masa pinjam selama 7 hari.</li>
              <li>Perpanjangan masa pinjam dapat dilakukan satu kali selama 7 hari tambahan.</li>
              <li>Proses peminjaman dilakukan dengan memilih buku dari katalog online dan mengajukan peminjaman.</li>
              <li>Pengambilan buku fisik dilakukan di meja petugas perpustakaan setelah peminjaman disetujui.</li>
              <li>Keterlambatan pengembalian dikenakan denda Rp500 per buku per hari.</li>
              <li>Buku yang rusak atau hilang wajib diganti dengan buku yang sama atau membayar sesuai harga buku.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16 px-4">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center mb-4"><img src="/smpn1sedati_logo.png" alt="Logo" className="h-12 w-12 mr-3" /><div><p className="font-bold">SMP NEGERI 1</p><p className="font-bold text-lg">SEDATI</p></div></div>
            <p className="font-bold mb-2">Alamat Perpustakaan SMPN 1 Sedati</p>
            <p className="text-gray-400">Jl. Raya Sedati No. XX, Sedati, Sidoarjo, Jawa Timur</p>
            <div className="flex gap-4 mt-4"><Instagram size={20} className="hover:text-blue-400 cursor-pointer transition-colors" /><Youtube size={20} className="hover:text-blue-400 cursor-pointer transition-colors" /><Mail size={20} className="hover:text-blue-400 cursor-pointer transition-colors" /><Twitter size={20} className="hover:text-blue-400 cursor-pointer transition-colors" /></div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div><div className="flex items-center mb-2"><Phone size={20} className="mr-3" /><p className="font-bold">Telephone/Whatsapp</p></div><p className="text-gray-400">0812-3456-7890</p></div>
            <div><div className="flex items-center mb-2"><Mail size={20} className="mr-3" /><p className="font-bold">Email</p></div><p className="text-gray-400">perpustakaan@smpn1sedati.sch.id</p></div>
          </div>
        </div>
        <div className="container mx-auto text-center border-t border-gray-700 mt-12 pt-8"><p className="text-gray-500">&copy; 2025 Perpustakaan SMPN 1 Sedati. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default LandingPage;