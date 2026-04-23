// components/site/CollageSection.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CollageImage {
  id: string;
  src: string;
  alt_text?: string;
}

interface CollageSectionProps {
  images: CollageImage[];
  showMoreLimit?: number;
  layoutPattern?: 'modulo-6' | 'masonry' | 'grid';
  onImageClick: (src: string) => void;
}

export function CollageSection({ 
  images, 
  showMoreLimit = 6, 
  layoutPattern = 'modulo-6',
  onImageClick 
}: CollageSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleImages = showAll ? images : images.slice(0, showMoreLimit);

  const getSpanClass = (index: number) => {
    if (layoutPattern === 'modulo-6') {
      const pattern = index % 6;
      if (pattern === 0) return 'col-span-2 row-span-2';
      if (pattern === 3) return 'col-span-2';
    }
    return '';
  };

  if (images.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl font-serif mb-10">
        Site Images
      </h1>

      {/* Collage Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
        {visibleImages.map((img, i) => (
          <div 
            key={img.id || i} 
            className={`rounded-xl overflow-hidden ${getSpanClass(i)}`}
          >
            <Image
              src={img.src}
              alt={img.alt_text || `collage ${i + 1}`}
              width={500}
              height={500}
              onClick={() => onImageClick(img.src)}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {images.length > showMoreLimit && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 rounded-full bg-indigo-600 text-white font-medium 
                       hover:bg-indigo-700 transition shadow-sm"
          >
            {showAll ? 'Show Less' : `Show More (${images.length - showMoreLimit})`}
          </button>
        </div>
      )}
    </section>
  );
}