import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Sparkles, UserRound, MapPin, Phone, Mail, LibraryBig, Eye, Target, Search, Book, ScanLine, User } from 'lucide-react';

const LandingPage = () => {
  const activities = [
    { title: "Membaca Bersama", description: "Sesi membaca buku cerita bersama untuk meningkatkan minat baca." },
    { title: "Workshop Menulis", description: "Pelatihan menulis kreatif untuk mengembangkan bakat siswa." },
    { title: "Diskusi Buku", description: "Forum diskusi tentang buku-buku terbaru dan klasik." },
    { title: "Lomba Literasi", description: "Berbagai lomba untuk mengasah kemampuan literasi siswa." },
  ];

  const librarians = [
    { name: "Bapak Budi Santoso", role: "Kepala Perpustakaan", image: "/placeholder.svg" },
    { name: "Ibu Siti Aminah", role: "Pustakawan", image: "/placeholder.svg" },
    { name: "Bapak Joko Susilo", role: "Staf Perpustakaan", image: "/placeholder.svg" },
  ];

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex flex-col md:flex-row justify-between items-center animate-fade-in-up sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center mb-4 md:mb-0">
          <img
            src="/smpn1sedati_logo.png"
            alt="Logo SMPN 1 SEDATI"
            className="h-10 w-10 object-contain mr-3"
          />
          <h1 className="text-2xl font-bold text-primary">SMPN 1 SEDATI</h1>
        </div>
        <nav className="flex flex-wrap justify-center gap-4">
          <Button variant="ghost" onClick={() => handleScrollToSection('about-us')} className="text-gray-700 hover:text-primary font-medium">Tentang Kami</Button>
          <Button variant="ghost" onClick={() => handleScrollToSection('vision-mission')} className="text-gray-700 hover:text-primary font-medium">Visi Misi</Button>
          <Button variant="ghost" onClick={() => handleScrollToSection('activities')} className="text-gray-700 hover:text-primary font-medium">Kegiatan</Button>
          <Button variant="ghost" onClick={() => handleScrollToSection('librarians')} className="text-gray-700 hover:text-primary font-medium">Pustakawan</Button>
          <Button variant="ghost" onClick={() => handleScrollToSection('school-info')} className="text-gray-700 hover:text-primary font-medium">Kontak</Button>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2">Login Siswa</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-32 px-4"
        style={{ backgroundImage: "url('/foto (2).jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="relative z-10 container mx-auto text-center text-white animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Selamat Datang di Perpustakaan Digital SMPN 1 Sedati
          </h2>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Cari buku favoritmu di sini..."
                className="w-full p-4 pr-28 rounded-full text-lg text-gray-800"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 py-2 text-base">
                <Search className="h-5 w-5 mr-2" />
                Cari
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link to="/dashboard">
              <Card className="text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-800">
                <CardContent className="p-6">
                  <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold">Katalog Buku</CardTitle>
                  <CardDescription>Jelajahi semua koleksi buku kami.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/student-visit-entry">
              <Card className="text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-800">
                <CardContent className="p-6">
                  <ScanLine className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold">Kunjungan</CardTitle>
                  <CardDescription>Catat kunjungan Anda ke perpustakaan.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link to="/profile">
              <Card className="text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-800">
                <CardContent className="p-6">
                  <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl font-bold">Profil Siswa</CardTitle>
                  <CardDescription>Lihat riwayat peminjaman dan denda.</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-us" className="py-20 px-6 container mx-auto bg-white rounded-xl shadow-lg -mt-16 relative z-10">
        <h3 className="text-4xl font-bold text-center mb-14 text-primary animate-fade-in-up">Tentang Perpustakaan Kami</h3>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-in-left" style={{ animationDelay: '0.8s' }}>
            <p className="text-lg leading-relaxed mb-6 text-gray-700">
              Perpustakaan SMPN 1 SEDATI adalah pusat sumber belajar yang menyediakan berbagai koleksi buku, majalah, dan media digital untuk mendukung kegiatan belajar mengajar dan pengembangan diri siswa. Kami berkomitmen untuk menciptakan lingkungan yang nyaman dan inspiratif bagi seluruh warga sekolah.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Dengan fasilitas modern dan koleksi yang terus diperbarui, kami berharap dapat menumbuhkan minat baca dan literasi di kalangan siswa, serta menjadi jembatan menuju ilmu pengetahuan yang tak terbatas.
            </p>
          </div>
          <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-2xl animate-slide-in-right" style={{ animationDelay: '1s' }}>
            <img
              src="/foto (1).jpg"
              alt="Interior Perpustakaan"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section id="vision-mission" className="bg-blue-50 py-20 px-6 container mx-auto mt-16 rounded-xl shadow-lg">
        <h3 className="text-4xl font-bold text-center mb-14 text-primary animate-fade-in-up" style={{ animationDelay: '1.2s' }}>Visi dan Misi Perpustakaan</h3>
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Visi */}
          <div className="animate-slide-in-left" style={{ animationDelay: '1.4s' }}>
            <div className="flex items-center mb-4">
              <Eye className="h-10 w-10 text-blue-600 mr-4" />
              <h4 className="text-3xl font-bold text-blue-700">Visi</h4>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Menjadi pusat sumber belajar yang unggul, inovatif, dan inspiratif untuk mendukung terciptanya generasi yang cerdas, berbudaya literasi tinggi, dan berakhlak mulia.
            </p>
          </div>
          {/* Misi */}
          <div className="animate-slide-in-right" style={{ animationDelay: '1.6s' }}>
            <div className="flex items-center mb-4">
              <Target className="h-10 w-10 text-blue-600 mr-4" />
              <h4 className="text-3xl font-bold text-blue-700">Misi</h4>
            </div>
            <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg leading-relaxed">
              <li>Menyediakan koleksi bahan pustaka yang relevan dan mutakhir.</li>
              <li>Menciptakan lingkungan perpustakaan yang nyaman, kondusif, dan menarik.</li>
              <li>Mengembangkan program-program literasi yang kreatif dan partisipatif.</li>
              <li>Meningkatkan kualitas layanan perpustakaan berbasis teknologi informasi.</li>
              <li>Membentuk karakter siswa yang gemar membaca, meneliti, dan berinovasi.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 px-6 container mx-auto mt-16">
        <h3 className="text-4xl font-bold text-center mb-14 text-primary animate-fade-in-up" style={{ animationDelay: '1.8s' }}>Kegiatan Perpustakaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <div key={index} className="animate-scale-in" style={{ animationDelay: `${2.0 + index * 0.1}s` }}>
                <Card className="h-full flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-primary">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-xl font-semibold text-primary">{activity.title}</CardTitle>
                    <Sparkles className="h-7 w-7 text-yellow-500" />
                  </CardHeader>
                  <CardContent className="text-gray-700 text-base flex-grow">
                    {activity.description}
                  </CardContent>
                </Card>
              </div>
            ))}
        </div>
      </section>

      {/* Librarians Section */}
      <section id="librarians" className="bg-blue-50 py-20 px-6 container mx-auto mt-16 rounded-xl shadow-lg">
        <h3 className="text-4xl font-bold text-center mb-14 text-primary animate-fade-in-up" style={{ animationDelay: '2.6s' }}>Pustakawan Kami</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {librarians.map((librarian, index) => (
            <Card key={index} className="text-center shadow-xl animate-scale-in hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:scale-105 border-t-4 border-accent">
              <CardContent className="pt-8">
                <div className="w-36 h-36 rounded-full mx-auto mb-6 object-cover border-4 border-blue-300 shadow-md flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <UserRound className="h-20 w-20 text-gray-600 opacity-70" />
                </div>
                <h4 className="text-2xl font-semibold text-primary mb-2">{librarian.name}</h4>
                <p className="text-blue-700 text-lg">{librarian.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* School Info Section */}
      <section id="school-info" className="bg-gradient-to-r from-primary to-indigo-700 text-white py-20 px-6 mt-16 animate-fade-in-up" style={{ animationDelay: '3.2s' }}>
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-8">Informasi Sekolah</h3>
          <p className="text-xl mb-6 max-w-2xl mx-auto font-light">
            SMPN 1 SEDATI adalah sekolah menengah pertama yang berlokasi di Sedati, Sidoarjo. Kami berkomitmen untuk menyediakan pendidikan berkualitas tinggi dan membentuk karakter siswa yang unggul.
          </p>
          <div className="space-y-4 text-xl max-w-xl mx-auto">
            <p className="flex items-center justify-center">
              <MapPin className="h-6 w-6 mr-3 text-blue-200" /> Jl. Raya Sedati No.1, Sedati, Sidoarjo, Jawa Timur
            </p>
            <p className="flex items-center justify-center">
              <Phone className="h-6 w-6 mr-3 text-blue-200" /> (031) 867xxxx
            </p>
            <p className="flex items-center justify-center">
              <Mail className="h-6 w-6 mr-3 text-blue-200" /> info@smpn1sedati.sch.id
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center flex items-center justify-center">
        <LibraryBig className="h-6 w-6 mr-3 text-gray-400" />
        <p className="text-lg">&copy; {new Date().getFullYear()} Perpustakaan SMPN 1 SEDATI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;