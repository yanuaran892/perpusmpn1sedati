import React, { useRef, useEffect } from 'react';
import { UserCircle, CheckCircle } from 'lucide-react';
import gsap from 'gsap'; // Import GSAP

interface LibrarianCardProps {
  name: string;
  title: string;
  image?: string;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      // Optimasi untuk performa animasi
      gsap.set(cardElement, { willChange: 'transform, box-shadow' });

      const handleMouseEnter = () => {
        gsap.to(cardElement, {
          scale: 1.03, // Memperbesar sedikit
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', // Bayangan lebih dalam
          duration: 0.4,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(cardElement, {
          scale: 1, // Kembali ke ukuran asli
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)', // Kembali ke bayangan asli
          duration: 0.4,
          ease: 'power2.out',
        });
      };

      cardElement.addEventListener('mouseenter', handleMouseEnter);
      cardElement.addEventListener('mouseleave', handleMouseLeave);

      // Cleanup event listeners saat komponen di-unmount
      return () => {
        cardElement.removeEventListener('mouseenter', handleMouseEnter);
        cardElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative w-72 h-[400px] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-end text-white"
      style={{
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 p-6 space-y-3">
        <div className="flex items-center">
          <h4 className="font-bold text-3xl leading-none">{name}</h4>
          <CheckCircle className="h-5 w-5 ml-2 text-blue-400" /> {/* Verified badge */}
        </div>
        <p className="text-lg opacity-90">{title}</p>
      </div>

      {/* Fallback for no image */}
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-600">
          <UserCircle className="h-48 w-48" />
        </div>
      )}
    </div>
  );
};

export default LibrarianCard;