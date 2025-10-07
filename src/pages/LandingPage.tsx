import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { BookOpen, UserRound, MapPin, Phone, Mail, LibraryBig, Instagram, Youtube, Twitter, Calendar, MessageSquare } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

const LandingPage = () => {
  const heroImages = ["/foto (1).png", "/foto (2).png", "/foto (3).png"];

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-full shadow-lg py-2 px-6 flex justify-between items-center">
          <nav className="flex items-center gap-6 text-white">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-300 transition-colors">Beranda</button>
            <button onClick={() => handleScrollToSection('about')} className="hover:text-blue-300 transition-colors">Tentang</button>
            <button onClick={() => handleScrollToSection('services')} className="hover:text-blue-300 transition-colors">Layanan</button>
            <button onClick={() => handleScrollToSection('librarians')} className="hover:text-blue-300 transition-colors">Pustakawan</button>
          </nav>
          <Link to="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Masuk</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative h-screen w-full">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="absolute inset-0 w-full h-full"
        >
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center">
          <img src="/smpn1sedati_logo.png" alt="Logo SMPN 1 Sedati" className="h-32 w-32 mb-4" />
          <h1 className="text-6xl md:text-7xl font-bold tracking-wider">PERPUSTAKAAN</h1>
          <h2 className="text-5xl md:text-6xl font-semibold">SMPN 1 SEDATI</h2>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section id="vision-mission" className="py-24 px-6 container mx-auto text-center">
        <h3 className="text-4xl font-bold mb-6">VISI & MISI</h3>
        <p className="max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed mb-16">
          Mewujudkan sekolah yang beriman, bertaqwa, berkarakter, berprestasi, dan peduli lingkungan dengan lulusan yang cerdas, kreatif, kompetitif, serta cinta tanah air melalui pembelajaran aktif, kreatif, dan menyenangkan; pengembangan potensi sesuai minat dan bakat; pendidik yang profesional; sarana prasarana ramah lingkungan; serta budaya disiplin, peduli, dan berpartisipasi dalam pelestarian lingkungan.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="shadow-lg rounded-2xl overflow-hidden text-left">
              <div className="bg-gray-200 h-48"></div>
              <CardContent className="p-6">
                <h4 className="font-bold text-xl mb-4">Judul Kegiatan Yang Dilaksanakan</h4>
                <div className="flex justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-2"><Calendar size={16} /> AGUSTUS 16, 2025</span>
                  <span className="flex items-center gap-2"><MessageSquare size={16} /> NO COMMENT</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tentang Section */}
      <section id="about" className="relative py-24 px-6 bg-cover bg-center" style={{ backgroundImage: "url('/foto (3).jpg')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto grid md:grid-cols-2 items-center">
          <div className="md:col-start-2 text-white p-8 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-sm tracking-widest">SELAMAT DATANG DI</p>
            <h3 className="text-4xl font-bold my-2">Perpustakaan SMPN 1 SEDATI</h3>
            <p className="text-lg font-semibold mb-4">Halo, Sobat Literasi!</p>
            <p className="text-gray-300 leading-relaxed">
              Perpustakaan SMPN 1 Sedati hadir sebagai pusat belajar dan sumber inspirasi bagi seluruh warga sekolah. Di sini, kamu dapat menemukan berbagai koleksi buku, majalah, e-book, dan referensi pembelajaran yang akan membantumu memperluas wawasan dan meningkatkan prestasi.
            </p>
          </div>
        </div>
      </section>

      {/* Pustakawan Section */}
      <section id="librarians" className="py-24 px-6 container mx-auto text-center">
        <h3 className="text-4xl font-bold mb-12 tracking-widest">PUSTAKAWAN</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {["Nama Pustakawan", "Nama Pustakawan", "Nama Pustakawan", "Nama Pustakawan"].map((name, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-40 h-52 bg-gray-200 rounded-2xl shadow-md mb-4"></div>
              <p className="font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Layanan Section */}
      <section id="services" className="relative py-24 px-6 bg-cover bg-center text-white text-center" style={{ backgroundImage: "url('/foto (2).jpg')" }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 container mx-auto">
          <h3 className="text-3xl font-bold">WAKTU PELAYANAN PERPUSTAKAAN</h3>
          <h4 className="text-2xl font-semibold mb-4">SMPN 1 SEDATI</h4>
          <p className="text-xl bg-white/20 inline-block px-4 py-2 rounded-md mb-12">Senin - Sabtu : 07.00 - 16.00 <br /> mengikuti waktu kegiatan sekolah</p>
          
          <h3 className="text-3xl font-bold">INFORMASI</h3>
          <h4 className="text-2xl font-semibold mb-6">Tata Cara Peminjaman Buku</h4>
          <ul className="list-disc list-inside text-left max-w-3xl mx-auto space-y-2 text-gray-300">
            <li>Login ke Website Perpustakaan SMPN 1 Sedati menggunakan akun yang telah terdaftar (username dan password).</li>
            <li>Siswa dapat meminjam maksimal 2 buku dan guru maksimal 5 buku dengan masa pinjam selama 7 hari.</li>
            <li>Perpanjangan masa pinjam dapat dilakukan satu kali selama 7 hari tambahan jika buku belum dipesan oleh anggota lain.</li>
            <li>Proses peminjaman dilakukan dengan memilih buku dari katalog online, lalu mengajukan peminjaman melalui tombol "Pinjam" di sistem.</li>
            <li>Pengambilan buku fisik dilakukan di meja petugas perpustakaan setelah peminjaman disetujui.</li>
            <li>Buku yang dikembalikan melewati batas waktu akan dikenakan denda sebesar Rp500 per buku per hari.</li>
            <li>Buku yang rusak akan dikenakan denda sesuai tingkat kerusakan. Jika rusak parah atau hilang, peminjam wajib mengganti dengan buku yang sama atau membayar sesuai harga nominal buku.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16 px-6">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center mb-4">
              <img src="/smpn1sedati_logo.png" alt="Logo" className="h-12 w-12 mr-3" />
              <div>
                <p className="font-bold">SMP NEGERI 1</p>
                <p className="font-bold text-lg">SEDATI</p>
              </div>
            </div>
            <p className="font-bold mb-2">Alamat Perpustakaan SMPN 1 Sedati</p>
            <p className="text-gray-400">Jl. Raya Sedati No. XX, Sedati, Sidoarjo, Jawa Timur</p>
            <div className="flex gap-4 mt-4">
              <Instagram size={20} className="hover:text-blue-400 cursor-pointer" />
              <Youtube size={20} className="hover:text-blue-400 cursor-pointer" />
              <Mail size={20} className="hover:text-blue-400 cursor-pointer" />
              <Twitter size={20} className="hover:text-blue-400 cursor-pointer" />
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-2">
                <Phone size={20} className="mr-3" />
                <p className="font-bold">Telephone/Whatsapp</p>
              </div>
              <p className="text-gray-400">0812-3456-7890</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Mail size={20} className="mr-3" />
                <p className="font-bold">Email</p>
              </div>
              <p className="text-gray-400">perpustakaan@smpn1sedati.sch.id</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto text-center border-t border-gray-700 mt-12 pt-8">
          <p className="text-gray-500">&copy; 2025 Perpustakaan SMPN 1 Sedati. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;