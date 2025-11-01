import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GalleryModal from '@/components/GalleryModal';

const galleryImages = [
  { src: "/foto (1).jpg", alt: "Interior Perpustakaan", title: "Sudut Baca Nyaman", description: "Area yang tenang untuk fokus belajar dan membaca." },
  { src: "/foto (2).png", alt: "Rak Buku Modern", title: "Koleksi Buku Lengkap", description: "Ribuan judul buku dari berbagai genre dan kategori." },
  { src: "/foto (3).jpg", alt: "Area Baca Nyaman", title: "Fasilitas Modern", description: "Meja dan kursi ergonomis untuk kenyamanan maksimal." },
  { src: "/public/hero_landing.png", alt: "Siswa Membaca", title: "Siswa Berliterasi", description: "Mendorong minat baca dan budaya literasi di sekolah." },
  { src: "/foto (2).jpg", alt: "Kegiatan Kelompok", title: "Ruang Diskusi", description: "Fasilitas untuk belajar kelompok dan kolaborasi." },
  { src: "/foto (1).png", alt: "Pustakawan Melayani", title: "Pelayanan Ramah", description: "Pustakawan siap membantu Anda menemukan buku." },
];

const GallerySection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ src: string; alt: string; title: string; description: string } | null>(null);

  const handleImageClick = (image: { src: string; alt: string; title: string; description: string }) => {
    setCurrentImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  return (
    <motion.section
      id="gallery"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('/subtle-dots.svg')] bg-repeat"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob-1"></div>
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob-2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen">GALERI PERPUSTAKAAN</h3>
        <p className="text-lg text-gray-700 text-center mb-16 max-w-3xl mx-auto">
          Jelajahi suasana dan fasilitas perpustakaan kami melalui koleksi foto-foto inspiratif ini.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              onClick={() => handleImageClick(image)}
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
      </div>

      {currentImage && (
        <GalleryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          imageUrl={currentImage.src}
          imageTitle={currentImage.title}
          imageDescription={currentImage.description}
        />
      )}
    </motion.section>
  );
};

export default GallerySection;