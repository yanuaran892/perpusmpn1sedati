import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GSAPButton from '@/components/GSAPButton';

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], ["15deg", "-15deg"]);
  const rotateY = useTransform(x, [-100, 100], ["-15deg", "15deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.section
      id="about"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50 overflow-hidden relative bg-[url('/subtle-dots.svg')] bg-repeat"
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="py-4 px-8">
          <motion.p
            className="text-lg font-semibold text-primary tracking-wider uppercase mb-2"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Selamat Datang di
          </motion.p>
          <motion.h3
            className="text-4xl md:text-5xl font-extrabold text-gray-900 font-guncen leading-tight mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            Perpustakaan SMPN 1 SEDATI
          </motion.h3>
          <motion.div
            className="w-24 h-1.5 bg-accent rounded-full mb-10"
            initial={{ width: 0 }}
            animate={inView ? { width: '6rem' } : {}}
            transition={{ duration: 1, delay: 0.5, ease: [0.2, 1, 0.2, 1] }}
          />
          <motion.p
            className="text-lg text-gray-700 leading-relaxed mb-12"
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

        <motion.div
          className="relative h-full flex items-center justify-center rounded-2xl p-4 bg-white shadow-2xl transform-gpu"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.2, 1, 0.2, 1] }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-[-10%] bg-blue-200 rounded-3xl transform -rotate-6 z-0"></div>
          <div className="absolute inset-[-10%] bg-accent/20 rounded-3xl transform rotate-6 z-0"></div>
          <img
            src="/foto (1).jpg"
            alt="Suasana Perpustakaan"
            className="relative w-full h-auto object-cover rounded-xl shadow-xl z-10"
            style={{ transform: "translateZ(50px)" }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutSection;