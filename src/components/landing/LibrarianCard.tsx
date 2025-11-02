import React from 'react';
import { UserCircle } from 'lucide-react';

interface LibrarianCardProps {
  name: string;
  title: string;
  image: string;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image }) => {
  return (
    <div className="relative z-10 flex flex-col items-center p-6 text-center">
      <div className="w-48 h-48 overflow-hidden bg-gray-100 flex items-center justify-center mb-4 rounded-lg border-b-4 border-primary/30 mx-auto">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <UserCircle className="h-28 w-28 text-blue-500/50" />
        )}
      </div>
      <h4 className="font-bold text-xl text-foreground mb-1 font-guncen">{name}</h4>
      <p className="text-base text-primary font-semibold">{title}</p>
    </div>
  );
};

export default LibrarianCard;