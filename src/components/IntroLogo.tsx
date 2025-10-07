import React from 'react';

const IntroLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
      <img
        src="/smpn1sedati_logo.png" // Menggunakan logo SMPN 1 SEDATI yang baru
        alt="Logo SMPN 1 SEDATI"
        className="h-48 w-48 object-contain mb-6 animate-pulse"
      />
      <h1 className="text-5xl font-extrabold text-center drop-shadow-lg mb-2">
        SMPN 1 SEDATI
      </h1>
      <p className="text-xl text-center opacity-90">
        Perpustakaan Digital
      </p>
    </div>
  );
};

export default IntroLogo;