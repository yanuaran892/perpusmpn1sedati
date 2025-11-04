import React, { useState, useEffect } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import LibrarianSection from '@/components/landing/LibrarianSection';
import GallerySection from '@/components/landing/GallerySection';
import InformationSection from '@/components/landing/InformationSection';
import ContactSection from '@/components/landing/ContactSection';
import LandingFooter from '@/components/landing/LandingFooter';

const LandingPage = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'librarians', 'gallery', 'information', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
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
    <div className="min-h-screen bg-white">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <LandingHeader 
        navLinks={navLinks} 
        onScrollToSection={scrollToSection} 
        isSheetOpen={isSheetOpen} 
        setIsSheetOpen={setIsSheetOpen}
        isScrolled={isScrolled}
      />
      
      <main>
        <HeroSection />
        <AboutSection />
        <LibrarianSection />
        <GallerySection />
        <InformationSection />
        <ContactSection />
      </main>
      
      <LandingFooter 
        onScrollToSection={scrollToSection} 
        navLinks={navLinks} 
      />
    </div>
  );
};

export default LandingPage;