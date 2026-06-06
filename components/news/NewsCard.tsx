// components/news/NewsCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    category_label: string;
    formatted_date: string;
    source?: string;
    version: number;
  };
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const imageUrl = `/api/news-image/${article.id}?v=${article.version || 1}`;
  
  return (
    <Link href={`/news/${article.slug}`}>
      <div className="group cursor-pointer flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden bg-gray-100 rounded-lg">
          <Image
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading={index < 4 ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-gray-500 mb-3 tracking-wide">
          <span className="uppercase">{article.category_label}</span>
          <span>|</span>
          <span>{article.formatted_date}</span>
          {article.source && (
            <>
              <span>|</span>
              <span>{article.source}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-serif text-slate-800 leading-snug group-hover:text-teal-700 transition-colors line-clamp-3">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}