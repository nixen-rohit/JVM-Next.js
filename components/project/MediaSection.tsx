// components/site/MediaSection.tsx
'use client';

import Image from 'next/image';

interface MediaImage {
  id: string;
  src: string;
  alt_text?: string;
  file_name?: string;
}

interface MediaSectionProps {
  images: MediaImage[];
  onImageClick: (src: string) => void;
}

export function MediaSection({ images, onImageClick }: MediaSectionProps) {
  if (images.length === 0) return null;

  return (
    <section className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-center text-3xl lg:text-4xl font-serif mb-10">
        Media Reports
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <button
            key={img.id || i}
            onClick={() => onImageClick(img.src)}
            className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer 
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label={`View media image ${i + 1}`}
          >
            <Image
              src={img.src}
              alt={img.alt_text || `Media report ${i + 1}`}
              height={600}
              width={600}

              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
              loading="lazy"
              draggable={false}
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                         flex items-end justify-center pb-4 pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-white text-sm font-medium tracking-wide">
                View Full Image
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}