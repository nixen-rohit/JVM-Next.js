"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";

// --- Custom Animated Counter Component ---
function Counter({
  from = 0,
  to,
  suffix = "",
  duration = 2,
}: {
  from?: number;
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.floor(value) + suffix;
          }
        },
      });

      return () => controls.stop();
    }
  }, [from, to, duration, suffix, inView]);

  return (
    <span ref={nodeRef}>
      {from}
      {suffix}
    </span>
  );
}

// --- Updated Mock Data: About Hero Slides ---
const heroSlides = [
  {
    id: 1,
    title: "Premium Real Estate & <br /> Lifestyle Development",
    image: "/about.avif",
    alt: "Premium Residential Development",
  },
  {
    id: 2,
    title: "Where Trust Meets <br /> Modern Living",
    image: "/about.avif",
    alt: "Luxury Villa Exterior",
  },
  {
    id: 3,
    title: "Creating Spaces for <br /> a Better Tomorrow",
    image: "/about.avif",
    alt: "Modern Sustainable Infrastructure",
  },
];

// --- Core Strengths Data ---
const coreStrengths = [
  "Premium residential and lifestyle developments",
  "Strategic project locations with high growth potential",
  "Modern planning and quality infrastructure",
  "Timely delivery with complete transparency",
  "Customer-centric approach and long-term trust",
  "Sustainable and future-focused community development",
];

const SLIDE_DURATION = 5000;

export default function About() {
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

  return (
    <main className="w-full min-h-screen bg-white text-slate-900 font-sans pb-24">
      {/* 1. Hero Section (Animated Slider & h-screen) */}
      <section className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen overflow-hidden bg-zinc-900">
        {/* Animated Background Images */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
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

        {/* Dark Overlays for Readability */}
        <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Hero Content & Controls */}
        <div className="absolute bottom-16 md:bottom-24 left-0 w-full z-20 pointer-events-none">
          <div className="w-full mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
            {/* Left: Dynamic Text Content */}
            <div className="flex flex-col items-start max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-4xl md:text-5xl lg:text-[4.5rem] font-serif text-white leading-[1.15] drop-shadow-lg mb-2 max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: heroSlides[currentSlide].title }}
                />
              </AnimatePresence>
              <p className="text-gray-300 tracking-widest text-xs uppercase font-medium mt-4">
                JMV Developers — Established 2008
              </p>
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

      {/* 2. Split Content Section */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32 flex flex-col lg:flex-row gap-16 lg:gap-24 items-stretch">
        {/* Left Column: Heading & Animated Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-5/12 flex flex-col justify-between"
        >
          <div className="max-w-md">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
              Our Legacy
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-[3.8rem] font-serif text-[#4a4f55] leading-[1.15] tracking-tight">
              Building Dreams with Excellence
            </h2>
          </div>

          {/* Animated Stats Row */}
          <div className="flex items-start gap-8 md:gap-12 mt-16 lg:mt-0">
            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-light text-[#2a3035] mb-2">
                <Counter to={18} suffix="+" duration={2} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold leading-tight">
                Years of
                <br /> Experience
              </span>
            </div>

            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-light text-[#2a3035] mb-2">
                <Counter to={100} suffix="%" duration={2.5} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold leading-tight">
                Transparency &
                <br /> Quality
              </span>
            </div>

            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-light text-[#2a3035] mb-2">
                <Counter to={4} suffix="" duration={1.5} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold leading-tight">
                Core Property
                <br /> Verticals
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Paragraphs & Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-7/12 flex flex-col gap-6"
        >
          <p className="text-gray-600 font-light text-lg leading-relaxed text-justify md:text-left">
            JMV Developers is a distinguished real estate brand established in 2008, 
            recognized for delivering premium residential and lifestyle developments with a 
            commitment to excellence, innovation, and trust. With extensive industry experience 
            and a strong professional network, the company has consistently created value-driven 
            projects that reflect modern architecture, strategic planning, and superior living standards.
          </p>

          <p className="text-gray-600 font-light text-lg leading-relaxed text-justify md:text-left">
            The company specializes in residential plots, builder floors, luxury villas, and 
            farmhouse developments, thoughtfully designed to meet the evolving aspirations of 
            modern homeowners and investors. Every project by JMV Developers is developed with 
            a vision to create well-planned communities that offer the perfect balance of comfort, 
            connectivity, lifestyle, and long-term investment potential.
          </p>

          <p className="text-gray-600 font-light text-lg leading-relaxed text-justify md:text-left mb-4">
            By selecting prime growth locations and integrating modern infrastructure with green 
            surroundings, the company continues to deliver developments that enhance both living 
            experiences and future value. Driven by professionalism and a forward-thinking approach, 
            JMV Developers continues to expand its footprint across emerging destinations while 
            maintaining the highest standards of integrity and excellence.
          </p>

          {/* Featured Right-Side Image */}
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100 shadow-sm rounded-sm">
            <Image
              src="/about.avif"
              alt="JMV Developers Premium Architecture"
              fill
              className="object-cover transition-transform duration-1000 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        </motion.div>
      </section>

      {/* --- New Section: 3. Core Strengths --- */}
      <section className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32">
        <hr className="border-gray-200 mb-16" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Section Subtitle Title Left */}
          <div className="lg:col-span-4">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
              Why Partner With Us
            </span>
            <h3 className="text-3xl md:text-4xl font-serif text-[#2a3035] leading-tight">
              Our Core Strengths
            </h3>
            <p className="text-gray-500 font-light mt-4 text-sm max-w-sm">
              Shaping the future of real estate by transforming premium spaces into vibrant, value-driven communities.
            </p>
          </div>

          {/* Grid Layout for Strengths Right */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {coreStrengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                {/* Minimalist modern counter icon */}
                <span className="text-xs font-mono text-gray-400 bg-gray-50 py-1 px-2 rounded-md">
                  0{index + 1}
                </span>
                <div>
                  <p className="text-[#3a4045] font-normal text-base md:text-lg leading-snug">
                    {strength}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}