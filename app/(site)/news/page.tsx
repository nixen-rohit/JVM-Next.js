"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { useNews } from "@/hooks/useNews";

// --- Mock Data: Hero Slides (TODO: Make dynamic from admin) ---
const heroSlides = [
  {
    id: 1,
    image: "/news1.jpg",
    subtitle: "Media Centre",
    title:
      "Upgrading Yamuna Expressway with modern LED lights and secure crash barriers.",
  },
  {
    id: 2,
    image: "/news2.jpg",
    subtitle: "Awards & Recognition",
    title:
      "The highly anticipated Jewar International Airport is rapidly becoming reality.",
  },
  {
    id: 3,
    image: "/news3.jpg",
    subtitle: "New Launch",
    title:
      "Allocating 30 prime acres along the Yamuna Expressway for a new CRPF base.",
  },
];

const categories = ["All", "Press Media", "Blog"];
const SLIDE_DURATION = 5000; // 5 seconds per slide

export default function News() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { articles, isLoading } = useNews(activeCategory);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Timer logic for the Hero Slider
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen bg-zinc-900 flex items-end overflow-hidden">
        {/* Animated Background Images */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Linear Overlay for Text Readability */}
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 md:pb-24 flex justify-between items-end pointer-events-none">
          {/* Animated Text Content */}
          <div className="max-w-3xl pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <p className="text-white/80 tracking-widest text-xs md:text-sm uppercase mb-4">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8 drop-shadow-lg">
                  {heroSlides[currentSlide].title}
                </h1>
                <button className="px-8 py-3 rounded-full border border-white text-white text-sm hover:bg-white hover:text-black transition-colors duration-300">
                  Read More
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Working Slider Controls */}
          <div className="hidden md:flex items-center gap-3 pb-4 pointer-events-auto">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="relative w-16 h-0.5 bg-white/30 overflow-hidden cursor-pointer hover:bg-white/50 transition-colors"
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <motion.div
                    key={currentSlide}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: SLIDE_DURATION / 1000,
                      ease: "linear",
                    }}
                    className="absolute top-0 left-0 h-full bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid Section */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-8 py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h2 className="text-5xl md:text-6xl font-serif text-slate-800">
            All Articles
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-md md:text-right leading-relaxed">
            Discover all the latest updates, insights, and valuable resources
            right here. This hub provides blog posts, press releases, and
            detailed guides to keep you up to date on our projects.
          </p>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                  activeCategory === cat
                    ? "bg-[#1a2327] text-white border-[#1a2327]"
                    : "bg-transparent text-gray-700 border-gray-300 hover:border-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-gray-500 transition-colors">
            <span className="text-gray-500">Sort by |</span>
            <span className="font-medium">Newest</span>
            <FiChevronDown className="ml-1" />
          </button>
        </div>

        {/* Articles Grid - Fixed Image Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {articles.map((article: any, index: number) => {
            // ✅ Build image URL from blob endpoint
            const imageUrl = `/api/news-image/${article.id}?v=${article.version || 1}`;
            
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                className="group cursor-pointer flex flex-col"
              >
                <Link href={`/news/${article.slug}`}>
                 <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden bg-gray-100 rounded-lg">
  {article.image_exists !== false ? (
    <img
      src={`/api/news-image/${article.id}?v=${article.version || 1}`}
      alt={article.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      loading={index < 4 ? "eager" : "lazy"}
      onError={(e) => {
        // Hide image on error, show placeholder
        (e.target as HTMLImageElement).style.display = 'none';
        const parent = (e.target as HTMLImageElement).parentElement;
        if (parent) {
          parent.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
          const placeholder = document.createElement('span');
          placeholder.className = 'text-gray-400 text-sm';
          placeholder.innerText = 'No image';
          parent.appendChild(placeholder);
        }
      }}
    />
  ) : (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-sm">No image</span>
    </div>
  )}
</div>

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

                  <h3 className="text-lg md:text-xl font-serif text-slate-800 leading-snug group-hover:text-teal-700 transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles found.</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for updates.</p>
          </div>
        )}
      </section>
    </main>
  );
}