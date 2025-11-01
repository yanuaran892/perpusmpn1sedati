import React from 'react';
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernInfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number; // Optional delay for entrance animation
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.2, 1, 0.2, 1] } },
};

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const ModernInfoCard: React.FC<ModernInfoCardProps> = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0,0,0.1), 0 10px 10px -5px rgba(0, 0,0,0.04)" }}
      className={cn(
        "relative group overflow-hidden rounded-2xl p-8 bg-white shadow-xl border border-gray-200",
        "flex flex-col items-center text-center h-full min-h-[280px]" // Increased min-height for more space
      )}
    >
      <motion.div
        variants={iconVariants}
        className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white mb-6 shadow-lg"
      >
        <Icon className="h-10 w-10" />
      </motion.div>
      <h4 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">{title}</h4>
      <p className="text-base text-gray-600 leading-relaxed">{description}</p>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </motion.div>
  );
};

export default ModernInfoCard;