import React from 'react';
import { UserCircle, CheckCircle, Users, BookOpen } from 'lucide-react';
import GSAPButton from '@/components/GSAPButton';

interface LibrarianCardProps {
  name: string;
  title: string;
  image?: string;
  description: string;
  booksBorrowed?: number;
  studentsHelped?: number;
}

const LibrarianCard: React.FC<LibrarianCardProps> = ({ name, title, image, description, booksBorrowed = 0, studentsHelped = 0 }) => {
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
        <p className="text-sm opacity-80 leading-relaxed">{description}</p>

        {/* Stats section */}
        <div className="flex items-center space-x-4 pt-2">
          <div className="flex items-center text-sm opacity-80">
            <BookOpen className="h-4 w-4 mr-1" /> {booksBorrowed} Buku Dipinjam
          </div>
          <div className="flex items-center text-sm opacity-80">
            <Users className="h-4 w-4 mr-1" /> {studentsHelped} Siswa Dibantu
          </div>
        </div>

        {/* Button */}
        <GSAPButton className="w-full mt-4 bg-white text-gray-800 hover:bg-gray-100 rounded-full py-2.5 font-semibold">
          Hubungi
        </GSAPButton>
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