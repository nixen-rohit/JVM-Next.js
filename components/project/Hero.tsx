// components/project/Hero.tsx

'use client';

import Image from 'next/image';
import { SoldOutRibbon } from '@/components/SoldOutRibbon';

interface HeroProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  status?: 'upcoming' | 'ongoing' | 'sold';
}

export function Hero({ title, subtitle, imageSrc, status }: HeroProps) {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Sold Out Ribbon */}
      {status === 'sold' && <SoldOutRibbon text="SOLD OUT" position="top-right" />}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
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