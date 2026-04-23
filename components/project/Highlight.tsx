// components/site/Highlight.tsx
'use client';

interface HighlightProps {
  title?: string;
  paragraph?: string;
  imageSrc: string;
}

export function Highlight({ title, paragraph, imageSrc }: HighlightProps) {
  return (
    <section 
      className="relative h-[60vh] sm:h-[70vh] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${imageSrc})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
        <div>
          {title && (
            <h2 className="text-white text-3xl sm:text-4xl lg:text-6xl font-serif mb-4 leading-tight">
              {title}
            </h2>
          )}
          {paragraph && (
            <p className="text-gray-200 max-w-6xl mx-auto text-sm sm:text-base">
              {paragraph}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}