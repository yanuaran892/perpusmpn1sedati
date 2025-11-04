import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      // Add a small delay before navigating to ensure the exit animation completes
      setTimeout(() => {
        navigate("/landing");
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/3 -left-1/3 w-[200%] h-[200%]">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-70 animate-blob"></div>
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.8 
                }}
                className="mb-8"
              >
                <img
                  src="/smpn1sedati_logo.png"
                  alt="Logo SMPN 1 SEDATI"
                  className="h-40 w-40 md:h-52 md:w-52 object-contain mx-auto drop-shadow-2xl"
                />
              </motion.div>

              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.3, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight font-guncen"
              >
                SMPN 1 SEDATI
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.6, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 font-light"
              >
                Perpustakaan Digital
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.9, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="w-48 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-10"
              ></motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-blue-200 text-lg">Menghubungkan ke masa depan</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;