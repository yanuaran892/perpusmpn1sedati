import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Import modular components
import LandingHeader from "@/components/landing/LandingHeader.tsx";
import HeroSection from "@/components/landing/HeroSection.tsx";
import AboutSection from "@/components/landing/AboutSection.tsx";
import LibrarianSection from "@/components/landing/LibrarianSection.tsx";
import GallerySection from "@/components/landing/GallerySection.tsx";
import InformationSection from "@/components/landing/InformationSection.tsx";
import ContactSection from "@/components/landing/ContactSection.tsx";
import LandingFooter from "@/components/landing/LandingFooter.tsx";

const LandingPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsSheetOpen(false);
  };

  const navLinks = [
    { id: 'about', label: 'Tentang' },
    { id: 'librarians', label: 'Pustakawan' },
    { id: 'gallery', label: 'Galeri' },
    { id: 'information', label: 'Informasi' },
    { id: 'contact', label: 'Kontak' },
  ];

  return (
    <div className="bg-white text-gray-800 font-sans">
      <LandingHeader
        navLinks={navLinks}
        onScrollToSection={handleScrollToSection}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        isScrolled={isScrolled}
      />

      <main className="pt-16">
        <HeroSection />
        <AboutSection />
        <LibrarianSection />
        <GallerySection />
        <InformationSection />
        <ContactSection />
      </main>

      <LandingFooter
        onScrollToSection={handleScrollToSection}
        navLinks={navLinks}
      />
    </div>
  );
};

export default LandingPage;