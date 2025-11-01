import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, BookOpen } from 'lucide-react';

const InformationSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      id="information"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative bg-gradient-to-br from-gray-900 to-blue-950 text-white overflow-hidden py-16 md:py-24"
    >
      <div className="absolute inset-[-50px] z-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-blob-3"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-16 drop-shadow-lg font-guncen">INFORMASI PENTING</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
    </motion.section>
  );
};

export default InformationSection;