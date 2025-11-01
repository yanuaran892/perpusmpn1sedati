import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import LibrarianCarousel from '@/components/LibrarianCarousel';

const librariansData = [
  { name: "", title: "Pustakawan Senior", image: "/foto (1).png" },
  { name: "", title: "Pustakawan Digital", image: "/foto (2).png" },
  { name: "", title: "Pustakawan Koleksi", image: "/foto (3).png" },
  { name: "", title: "Pustakawan Anak", image: "/foto (1).png" },
  { name: "", title: "Pustakawan Arsip", image: "/foto (2).png" },
  { name: "", title: "Pustakawan Referensi", image: "/foto (3).png" },
];

const LibrarianSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      id="librarians"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-blue-50 overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h3
          className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          TIM PUSTAKAWAN KAMI
        </motion.h3>
        <LibrarianCarousel librarians={librariansData} />
      </div>
    </motion.section>
  );
};

export default LibrarianSection;