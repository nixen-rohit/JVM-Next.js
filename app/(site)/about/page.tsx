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

// --- Mock Data: About Hero Slides ---

const heroSlides = [
  {
    id: 1,

    image: "/about.avif",

    alt: "Coastal Landscape",
  },

  {
    id: 2,

    image: "/about.avif",

    alt: "Luxury Villa Exterior",
  },

  {
    id: 3,

    image: "/about.avif",

    alt: "Modern Interior",
  },
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
    <main className="w-full min-h-screen bg-white text-slate-900 font-sans pb-20">
      {/* 1. Hero Section (Animated Slider & h-screen) */}

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

        {/* Dark Overlays for Readability */}

        <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none" />

        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="absolute inset-0 z-10 bg-linear-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Hero Content & Controls */}

        <div className="absolute bottom-16 md:bottom-24 left-0 w-full z-20 pointer-events-none">
          <div className="w-full mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
            {/* Left: Text Content */}

            <div className="flex flex-col items-start max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-5xl lg:text-[4.5rem] font-serif text-white leading-[1.1] drop-shadow-lg mb-6 max-w-3xl"
              >
                Building a Legacy of <br /> Trusted Excellence
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

      {/* 2. Split Content Section */}

      <section className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20 pt-24 md:pt-32 flex flex-col lg:flex-row gap-16 lg:gap-24 items-stretch">
        {/* Left Column: Heading & Animated Stats */}

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-5/12 flex flex-col justify-between"
        >
          <h2 className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif text-[#4a4f55] leading-[1.15] tracking-tight max-w-md">
            Building Trust, Delivering Quality—One Home at a Time
          </h2>

          {/* Animated Stats Row */}

          <div className="flex items-start gap-8 md:gap-12 mt-16 lg:mt-32">
            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-light text-[#2a3035] mb-2">
                <Counter to={25} suffix="+" duration={2} />
              </div>

              <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold leading-tight">
                Properties
                <br /> Developed
              </span>
            </div>

            <div className="flex flex-col">
              <div className="text-4xl md:text-5xl font-light text-[#2a3035] mb-2">
                <Counter to={14} suffix="+" duration={2} />
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
                Delighted
                <br /> Clients
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
          <p className="text-gray-600 font-light text-lg md:text-xl lg:text-xl leading-relaxed text-justify md:text-left">
            JMV Developers, established in 2008, is a renowned real estate brand
            delivering quality residential and lifestyle projects across India.
            With a strong network and years of industry experience, the company
            specializes in residential plots, builder floors, villas, and
            farmhouses. Known for its commitment to quality, timely delivery,
            and customer satisfaction, JMV Developers continues to create
            well-planned communities that meet modern living standards and
            diverse lifestyle needs.
          </p>

          <p className="text-gray-600 font-light text-lg md:text-xl lg:text-xl leading-relaxed text-justify md:text-left mb-6">
            Expanding its footprint in recent years, JMV Developers is shaping
            quality real estate across key locations, from residential plots to
            builder floors, villas, and farmhouses—while continuing to deliver
            well-planned, customer-focused developments that combine modern
            living, strategic locations, and long-term value for homeowners and
            investors alike.
          </p>

          {/* Featured Right-Side Image */}

          <div className="relative w-full aspect-video md:aspect-21/9 lg:aspect-video overflow-hidden bg-gray-100 shadow-md">
            <Image
              src="/about.avif"
              alt="Luxury Waterfront Property"
              fill
              className="object-cover transition-transform duration-1000 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
