// components/site/Hero.tsx
'use client';

import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  imageSrc: string; // data:image/jpeg;base64,... or public URL
}

export function Hero({ title, subtitle, imageSrc }: HeroProps) {
  return (
    <section
      className="relative h-[70vh] w-full bg-cover bg-center md:bg-fixed"
      style={{ backgroundImage: `url(${imageSrc})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        {subtitle && (
          <p className="text-gray-300 mb-2 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight">
          {title}
        </h1>
      </div>
    </section>
  );
}