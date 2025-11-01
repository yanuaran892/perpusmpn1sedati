import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import GSAPButton from '@/components/GSAPButton';

interface Librarian {
  name: string;
  title: string;
  image?: string; // Optional image URL
}

interface LibrarianCarouselProps {
  librarians: Librarian[];
}

const LibrarianCarousel: React.FC<LibrarianCarouselProps> = ({ librarians }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center', // Centers the selected slide
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    onInit(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  const activeLibrarian = librarians[selectedIndex];

  return (
    <div className="relative flex flex-col items-center">
      <div className="embla overflow-hidden w-full max-w-3xl" ref={emblaRef}>
        <div className="embla__container flex touch-pan-y items-center h-[400px] gap-x-8"> {/* Removed justify-center, added gap-x-8 */}
          {librarians.map((librarian, index) => {
            const isSelected = index === selectedIndex;

            // Adjust these values for desired visual effect
            const scale = isSelected ? 1.1 : 0.8; // Active card slightly larger
            const opacity = isSelected ? 1 : 0.4; // Active card fully opaque
            const grayscale = isSelected ? 0 : 100; // Active card in color
            
            return (
              <div
                className="embla__slide flex-none relative flex justify-center items-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4" // Responsive width for slides
                key={index}
              >
                <motion.div
                  className="relative flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border-4 border-gray-200 w-full h-[300px] justify-center transition-all duration-500 ease-out" // Changed w-[250px] to w-full
                  style={{
                    scale: scale,
                    filter: `grayscale(${grayscale}%)`,
                    opacity: opacity,
                    zIndex: isSelected ? 10 : 1, // Bring active card to front
                  }}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md">
                    {librarian.image ? (
                      <img src={librarian.image} alt={librarian.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="h-20 w-20 text-blue-500/50" />
                    )}
                  </div>
                  <p className="font-bold text-lg text-gray-900 mb-1">{librarian.name}</p>
                  <p className="text-sm text-primary">{librarian.title}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <GSAPButton
        className="embla__button embla__button--prev absolute top-1/2 -translate-y-1/2 left-0 md:-left-12 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        variant="ghost"
        size="icon"
      >
        <ChevronLeft className="h-6 w-6" />
      </GSAPButton>
      <GSAPButton
        className="embla__button embla__button--next absolute top-1/2 -translate-y-1/2 right-0 md:-right-12 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        variant="ghost"
        size="icon"
      >
        <ChevronRight className="h-6 w-6" />
      </GSAPButton>

      {/* Dots Pagination */}
      <div className="embla__dots flex justify-center mt-8 space-x-2 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={cn(
              'embla__dot w-4 h-4 rounded-full bg-gray-500 transition-colors duration-200',
              index === selectedIndex && 'bg-primary'
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>

      {/* Active Librarian Details */}
      {activeLibrarian && (
        <motion.div
          key={selectedIndex} // Key for re-animating on index change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-16 bg-gray-300 mr-4" />
            <p className="font-bold text-3xl text-gray-900 font-guncen">{activeLibrarian.name}</p>
            <div className="h-px w-16 bg-gray-300 ml-4" />
          </div>
          <div className="flex items-center justify-center">
            <div className="h-px w-10 bg-gray-300 mr-3" />
            <p className="text-xl text-primary font-semibold">{activeLibrarian.title}</p>
            <div className="h-px w-10 bg-gray-300 ml-3" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LibrarianCarousel;