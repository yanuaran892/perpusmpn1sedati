import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UserCircle } from 'lucide-react'; // Import UserCircle icon

const librariansData = [
  { name: "Titik Darmayu S, S.Pd.", title: "Pustakawan Senior", image: "/foto (1).png" },
  { name: "Haniifah Roosyidah R, S.Pd.", title: "Pustakawan Digital", image: "/foto (2).png" },
];

const LibrarianSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" as any } }, // Menggunakan 'as any' untuk mengatasi masalah tipe
  };

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
          transition={{ duration: 0.7, ease: "easeInOut" as any }} // Menggunakan 'as any' untuk mengatasi masalah tipe
        >
          TIM PUSTAKAWAN KAMI
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {librariansData.map((librarian, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-200/50 w-full max-w-sm p-6 text-center transition-all duration-500 ease-out overflow-hidden hover:shadow-2xl hover:scale-105"
            >
              <div className="w-full aspect-[9/16] overflow-hidden bg-gray-100 flex items-center justify-center mb-6 rounded-lg border-b-4 border-primary/30">
                {librarian.image ? (
                  <img src={librarian.image} alt={librarian.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="h-32 w-32 text-blue-500/50" />
                )}
              </div>
              <h4 className="font-bold text-3xl text-gray-900 mb-1 font-guncen">{librarian.name}</h4>
              <p className="text-xl text-primary font-semibold">{librarian.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default LibrarianSection;