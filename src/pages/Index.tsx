import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IntroLogo from "@/components/IntroLogo"; // Import komponen IntroLogo

const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      navigate("/landing"); // Mengarahkan ke LandingPage setelah intro selesai
    }, 3000); // Tampilkan intro selama 3 detik

    return () => clearTimeout(timer); // Bersihkan timer saat komponen di-unmount
  }, [navigate]);

  return (
    <>
      {showIntro ? (
        <IntroLogo />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Loading...</h1>
            <p className="text-xl text-gray-600">
              Redirecting to the library application.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;