"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PiBuildingsLight, PiTreePalmLight } from "react-icons/pi";
import CareerStats from "@/components/CareerStats";
import CareerHeader from "@/components/CarrerHeader";


// --- Mock Data: Career Hero Slides ---
const heroSlides = [
  {
    id: 1,
    image: "/career1.avif",
    alt: "Corporate Office Environment",
  },
  {
    id: 2,
    image: "/career2.webp",
    alt: "Team Collaboration and Meeting",
  },
  {
    id: 3,
    image: "/career3.webp",
    alt: "Luxury Real Estate Property",
  },
];

const SLIDE_DURATION = 5000;

export default function Career() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  return (
    <main className="w-full min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen overflow-hidden bg-zinc-900">
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
              alt={heroSlides[currentSlide].alt}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Overlays */}
        <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Hero Content & Controls */}
        <div className="absolute bottom-12 md:bottom-30 left-0 w-full z-20 pointer-events-none">
          <div className="w-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
            {/* Left: Text Content */}
            <div className="flex flex-col items-start max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white/80 tracking-[0.2em] text-sm md:text-lg lg:text-xl uppercase mb-4 font-light"
              >
                Careers at JMV Developers
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight drop-shadow-md text-left"
              >
                Build Your Future
              </motion.h1>
            </div>

            {/* Right: Slider Controls */}
            <div className="hidden md:flex items-center gap-3 pb-2">
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
        </div>
      </section>

     

      <CareerHeader/>

      <CareerStats/>
    </main>
  );
}
