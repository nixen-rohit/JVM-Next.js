// components/site/UnitSection.tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UnitImage {
  id: string;
  src: string;
  alt_text?: string;
}

interface UnitSectionProps {
  images: UnitImage[];
  onImageClick: (src: string) => void;
}

export function UnitSection({ images, onImageClick }: UnitSectionProps) {
  if (images.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-serif mb-8 sm:mb-10">
        Unit Measurements
      </h2>
      <UnitSlider images={images} onImageClick={onImageClick} />
    </section>
  );
}

function UnitSlider({ 
  images, 
  onImageClick 
}: { 
  images: UnitImage[]; 
  onImageClick: (src: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.9;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <div className="flex absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 gap-3">
        <button
          onClick={() => scroll('left')}
          className="bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition 
                     focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="bg-white/90 p-2.5 rounded-full shadow-md hover:bg-white transition 
                     focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Scrollable Slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory 
                   px-1 sm:px-2 pb-14
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <button
            key={img.id || i}
            onClick={() => onImageClick(img.src)}
            className="
              snap-start shrink-0
              w-[85%] sm:w-[48%] lg:w-[31%]
              aspect-4/3
              rounded-xl overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-teal-500
            "
            aria-label={`View unit layout ${i + 1}`}
          >
            <div className="relative w-full h-full">
              <Image
                src={img.src}
                alt={img.alt_text || `Unit layout ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 31vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                draggable={false}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}