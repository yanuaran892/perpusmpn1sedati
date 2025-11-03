import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import LibrarianCard from './LibrarianCard';

const librariansData = [
  {
    name: "Titik Darmayu S, S.Pd.",
    title: "Pustakawan",
    image: "/foto (1).png",
    // description, booksBorrowed, studentsHelped dihapus
  },
  {
    name: "Haniifah Roosyidah R, S.Pd.",
    title: "Pustakawan",
    image: "/foto (2).png",
    // description, booksBorrowed, studentsHelped dihapus
  },
];

const LibrarianSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 1, 0.2, 1] } },
  };

  return (
    <motion.section
      id="librarians"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden relative bg-[url('/subtle-dots.svg')] bg-repeat"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h3
          className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-widest text-gray-900 font-guncen"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.2, 1, 0.2, 1] }}
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
              className="group relative p-0 text-center transition-all duration-500 ease-out overflow-hidden hover:shadow-2xl hover:scale-105
                         rounded-2xl shadow-xl"
            >
              <LibrarianCard
                name={librarian.name}
                title={librarian.title}
                image={librarian.image}
                // description, booksBorrowed, studentsHelped tidak lagi diteruskan
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default LibrarianSection;