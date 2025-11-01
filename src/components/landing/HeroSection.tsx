import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import GSAPButton from '@/components/GSAPButton';

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 1, 0.2, 1] } },
};

const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/foto (3).png')",
        }}
      ></motion.div>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center w-full px-4">
        <motion.img src="/smpn1sedati_logo.png" alt="Logo SMPN 1 Sedati" className="h-28 w-28 md:h-40 md:w-40 mb-6 drop-shadow-lg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }} />
        <motion.h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider drop-shadow-lg leading-tight mb-4 font-guncen" initial="hidden" animate="visible" variants={textVariants}>PERPUSTAKAAN</motion.h1>
        <motion.h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-8 leading-tight font-guncen" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.2 }}>SMP NEGERI 1 SEDATI</motion.h2>
        <motion.p className="text-lg md:text-xl italic max-w-md drop-shadow-lg mb-10 font-ccspaghettiwestern" initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.4 }}>"Kalau engkau hanya membaca buku yang dibaca semua orang, engkau hanya bisa berpikir sama seperti semua orang."<br />(Haruki Murakami).</motion.p>
        <motion.div initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.6 }}>
          <Link to="/login"><GSAPButton className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-4 text-xl font-semibold shadow-xl transition-all duration-300 transform hover:scale-105">Mulai Jelajahi</GSAPButton></Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;