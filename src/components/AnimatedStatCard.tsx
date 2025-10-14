import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface AnimatedStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  isNumeric?: boolean;
  animationDelay?: number;
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({ icon: Icon, label, value, isNumeric = true, animationDelay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: animationDelay },
    },
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={cardVariants}>
      <Card className="bg-white text-primary border-primary shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-center">
          <Icon className="h-10 w-10 mb-3 text-primary" />
          {isNumeric && typeof value === 'number' ? (
            <motion.p
              className="text-4xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeOut",
                delay: animationDelay + 0.2,
              }}
            >
              {value}
            </motion.p>
          ) : (
            <p className="text-4xl font-bold">{value}</p>
          )}
          <p className="text-base opacity-80">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedStatCard;