import React from 'react';
import { UserCircle, CheckCircle } from 'lucide-react'; // CheckCircle masih digunakan untuk badge

interface LibrarianCardProps {
  name: string;
  title: string;
  image?: string;
  // description, booksBorrowed, studentsHelped dihapus
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image }) => {
  return (
    <div
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
        {/* Deskripsi, statistik, dan tombol dihapus */}
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