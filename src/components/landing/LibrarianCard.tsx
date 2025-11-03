import React from 'react';
import { UserCircle } from 'lucide-react';

interface LibrarianCardProps {
  name: string;
  title: string;
  image?: string;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image }) => {
  return (
    <>
      <div className="relative z-10 flex flex-col items-center p-6 text-center w-72 h-[400px]">
        {/* Decorative background shape behind the image */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-200/50 rounded-full blur-xl opacity-70 animate-blob-1" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Image container */}
        <div className="relative w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-blue-300 shadow-lg bg-white flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="h-48 w-48 text-blue-500/50" />
          )}
        </div>

        <h4 className="font-bold text-2xl text-gray-900 mb-1">{name}</h4>
        <p className="text-lg text-blue-600">{title}</p>
      </div>
    </>
  );
};

export default LibrarianCard;