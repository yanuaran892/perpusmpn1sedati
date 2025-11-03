import React from 'react';
import { UserCircle } from 'lucide-react';

interface LibrarianCardProps {
  name: string;
  title: string;
  image: string;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image }) => {
  return (
    <div className="relative z-10 flex flex-col items-center p-6 text-center w-72 h-[400px]"> {/* Fixed size for the card */}
      {/* Decorative background shape behind the image */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-200/50 rounded-full blur-xl opacity-70 animate-blob-1" style={{ animationDelay: '0.1s' }}></div>
      
      {/* Image container */}
      <div className="relative z-20 w-56 h-72 overflow-hidden bg-gray-100 flex items-center justify-center rounded-lg shadow-xl border-b-4 border-primary/30 transform transition-transform duration-300 group-hover:scale-105">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <UserCircle className="h-48 w-48 text-blue-500/50" /> {/* Larger placeholder icon */}
        )}
      </div>
      <h4 className="font-bold text-2xl text-foreground mt-6 mb-1 font-guncen">{name}</h4> {/* Adjusted margin-top */}
      <p className="text-lg text-primary font-semibold">{title}</p>
    </div>
  );
};

export default LibrarianCard;