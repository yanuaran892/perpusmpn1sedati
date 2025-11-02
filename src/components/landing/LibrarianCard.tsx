import React from 'react';
import { motion, Variants } from 'framer-motion';
import { UserCircle } from 'lucide-react';

interface LibrarianCardProps {
  name: string;
  title: string;
  image: string;
  variants: Variants;
  delay: number;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image, variants, delay }) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="glowing-card flex flex-col items-center justify-center p-6 text-center" // Apply custom class and Tailwind for content
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-48 h-48 overflow-hidden bg-gray-100 flex items-center justify-center mb-4 rounded-lg border-b-4 border-primary/30">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="h-24 w-24 text-blue-500/50" />
          )}
        </div>
        <h4 className="font-bold text-xl text-foreground mb-1 font-guncen">{name}</h4>
        <p className="text-base text-primary font-semibold">{title}</p>
      </div>
    </motion.div>
  );
};

export default LibrarianCard;