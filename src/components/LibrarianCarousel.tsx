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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
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

  return (
    <div className="relative">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex touch-pan-y -ml-4">
          {librarians.map((librarian, index) => (
            <div className="embla__slide flex-none min-w-0 pl-4" key={index}>
              <motion.div
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 h-full"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md">
                  {librarian.image ? (
                    <img src={librarian.image} alt={librarian.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-24 w-24 text-blue-500/50" />
                  )}
                </div>
                <p className="font-bold text-xl text-gray-900 mb-1">{librarian.name}</p>
                <p className="text-sm text-primary">{librarian.title}</p>
              </motion.div>
            </div>
          ))}
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
      <div className="embla__dots flex justify-center mt-8 space-x-2 z-10"> {/* Added z-10 for good measure */}
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={cn(
              'embla__dot w-4 h-4 rounded-full bg-gray-500 transition-colors duration-200', // Changed to w-4 h-4 and bg-gray-500
              index === selectedIndex && 'bg-primary'
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default LibrarianCarousel;