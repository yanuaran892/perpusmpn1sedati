import React, { useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import gsap from 'gsap'; // Import GSAP

interface LandingPageCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const LandingPageCard: React.FC<LandingPageCardProps> = ({ icon: Icon, title, description }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null); // Ref untuk elemen SVG ikon
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Set status awal konten: tersembunyi dengan rotasi X -90 derajat
      gsap.set(contentRef.current, { rotationX: -90, transformOrigin: 'bottom' });
    }
  }, []);

  const handleMouseEnter = () => {
    if (iconRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.to(iconRef.current, { scale: 0, duration: 0.3, ease: 'power2.in' })
        .to(contentRef.current, { rotationX: 0, duration: 0.6, ease: 'power2.out' }, '<0.1'); // Animasi konten sedikit tertunda
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.to(contentRef.current, { rotationX: -90, duration: 0.6, ease: 'power2.in' })
        .to(iconRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' }, '<0.1'); // Animasi ikon sedikit tertunda
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm h-[200px] bg-card rounded-xl flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white/50 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      <Icon ref={iconRef} className="w-12 h-12 text-primary" />

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute inset-0 p-5 box-border bg-card"
      >
        <p className="text-xl font-bold text-foreground mb-2">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default LandingPageCard;