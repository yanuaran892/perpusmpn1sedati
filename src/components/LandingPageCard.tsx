import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LandingPageCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const LandingPageCard: React.FC<LandingPageCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="group relative w-full max-w-sm h-[200px] bg-card rounded-xl flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white/50 transition-all duration-600 ease-in-out hover:scale-105 hover:shadow-xl">
      {/* Icon */}
      <Icon className="w-12 h-12 text-primary transition-all duration-600 ease-in-out group-hover:scale-0" />

      {/* Content */}
      <div className="absolute inset-0 p-5 box-border bg-card transform-gpu rotate-x-90 origin-bottom transition-all duration-600 ease-in-out group-hover:rotate-x-0">
        <p className="text-xl font-bold text-foreground mb-2">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default LandingPageCard;