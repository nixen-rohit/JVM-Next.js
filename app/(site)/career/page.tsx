"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PiBuildingsLight, PiTreePalmLight } from "react-icons/pi";

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

      {/* 2. Split Content Section - Perfectly matches the Hero's max-w-[90rem] constraint */}
      <section className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-32 flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex flex-col items-start"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#2a3035] leading-[1.1] mb-6 tracking-tight">
            Unlock Exclusive
            <br /> Job Opportunities
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8 font-light text-lg md:text-xl lg:text-xl pr-4">
            Join a network of passionate professionals and industry experts
            shaping the future of real estate in India. JMV Developers has built
            a strong reputation for quality, trust, and timely delivery,
            offering diverse residential opportunities including plots, builder
            floors, villas, and farmhouses. Be part of a people-first
            organization that values excellence, growth, and
            innovation—empowering you to deliver meaningful solutions and create
            lasting impact for clients.
          </p>

          <div className="w-full mt-2">
            <p className="text-[#2a3035] font-medium text-lg mb-1">
              Post your resume to us at
            </p>
            <a
              href="mailto:info@jmvdevelopers.com"
              className="text-teal-700 hover:text-teal-900 transition-colors underline underline-offset-4 decoration-teal-700/30 hover:decoration-teal-900 font-semibold text-lg"
            >
              info@jmvdevelopers.com
            </a>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 relative flex flex-col sm:flex-row gap-12 sm:gap-0 mt-4 lg:mt-0"
        >
          {/* Vertical Divider Line with Diamond */}
          <div className="hidden sm:block absolute left-1/2 top-10 bottom-4 w-px bg-gray-200 -translate-x-1/2">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 border border-gray-300 bg-white rotate-45" />
          </div>

          {/* Column 1: UAE Projects */}
          <div className="w-full sm:w-1/2 sm:pr-12 flex flex-col">
            <h3 className="text-[14px] font-semibold text-teal-800 mb-8">
              Explore Careers in Real Estate.
            </h3>

            <div className="text-[#5b7380] mb-6">
              <PiBuildingsLight size={85} strokeWidth={2} />
            </div>

            <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4">
              Job Titles
            </h4>
            <p className="text-gray-500 font-light text-lg md:text-xl lg:text-xl leading-relaxed">
              Real Estate Clerk, Real Estate Manager, Sales Assistant
            </p>
          </div>

          {/* Column 2: CBI Caribbean */}
          <div className="w-full sm:w-1/2 sm:pl-12 flex flex-col sm:mt-13">
            <div className="text-[#5b7380] mb-6">
              <PiTreePalmLight size={85} strokeWidth={2} />
            </div>

            <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4">
              Skill Sets
            </h4>
            <p className="text-gray-500 font-light text-lg md:text-xl lg:text-xl leading-relaxed">
              High Performance, Passionate Teamwork, Dedication, Energetic,
              Problem Solving, Initiative & Enterprise
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
