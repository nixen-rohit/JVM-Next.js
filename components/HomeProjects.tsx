"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

// 1. Define the Property Data
const properties = [
  {
    id: "shyam-vihar-project",
    title: "Shyam Vihar NH-52 Jaipur Sikar Highway",
    description:
      "A modern gated community designed for comfortable living with well-planned plots, wide blacktop roads, street lights, water facilities, and secure surroundings. Build your dream home in a premium and peaceful location.",
    image: "/SamotaKaBass.jpeg",
  },

  {
    id: "shyam-vihar-2",
    title: "Shyam Vihar 2 Aloda Palsana Road",
    description:
      "Shyam Vihar 2 is a well-developed residential plotting project designed for comfortable living and smart investment. With organized plots, wide roads, street lighting, and essential amenities, it offers the ideal blend of convenience and community living.",
    image: "/shyamviharaloda.jpeg",
  },
  {
    id: "star-x-city-bhiwadi",
    title: "Star x city Bhiwadi",
    description:
      "Star X City is a well-planned residential township offering a perfect combination of comfort, infrastructure, and future growth. Designed for modern living, the project provides organized plots, quality development, and a vibrant community environment.",
    image: "/harit-homes.jpg",
  },
];

// 2. Sub-component to detect when an image scrolls into view (Desktop Only)
const ImageBlock = ({
  src,
  alt,
  index,
  onVisible,
}: {
  src: string;
  alt: string;
  index: number;
  onVisible: (i: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Triggers when the block hits the vertical center of the screen
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (isInView) {
      onVisible(index);
    }
  }, [isInView, index, onVisible]);

  return (
    <div
      ref={ref}
      className="h-[80vh] w-full flex items-center justify-center py-10"
    >
      <div className="relative w-full h-full max-w-2xl overflow-hidden bg-gray-100">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />
        {/* Placeholder Logo Box to mimic the design */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest text-center p-4">
          {alt}
        </div>
      </div>
    </div>
  );
};

// 3. Main Projects Component
export default function HomeProjects() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="projects-section"
      className="relative w-full bg-white text-black min-h-screen"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-6 md:px-12 relative py-12 md:py-0">
        {/* Left Side: Scrolling Images (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) */}
        <div className="hidden md:block w-full md:w-1/2 pt-[10vh] pb-[30vh]">
          {properties.map((property, index) => (
            <ImageBlock
              key={property.id}
              src={property.image}
              alt={property.title}
              index={index}
              onVisible={setActiveIndex}
            />
          ))}
        </div>

        {/* Right Side: Accordion on Mobile / Sticky Text on Desktop */}
        <div className="w-full md:w-1/2 relative">
          <div className="md:sticky md:top-0 md:h-screen flex flex-col justify-center pl-0 md:pl-20 md:py-20">
            <h1 className="text-xl md:text-3xl font-serif font-bold text-black tracking-widest text-center md:text-left uppercase mb-10 md:mb-12">
              Our Projects
            </h1>

            <div className="flex flex-col gap-8 md:gap-6">
              {properties.map((property, index) => {
                const isActive = index === activeIndex;

                return (
                  <div key={property.id} className="flex flex-col">
                    {/* Title (Acts as accordion button on mobile) */}
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={`text-left text-3xl md:text-5xl font-serif transition-colors duration-500 ${
                        isActive ? "text-slate-800" : "text-slate-300"
                      }`}
                    >
                      {property.title}
                    </button>

                    {/* Expandable Description & Mobile Image */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            marginTop: 20,
                          }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-600 leading-relaxed max-w-md">
                            {property.description}
                          </p>
                          <Link
                            href={`/projects/${property.id}`}
                            className="mt-6 text-sm font-medium border-b border-gray-400 pb-1 hover:border-gray-800 transition-colors inline-block mb-2"
                          >
                            Learn More
                          </Link>

                          {/* MOBILE IMAGE: Shown only on mobile devices inside the accordion */}
                          <div className="md:hidden relative w-full aspect-4/3 mt-6 bg-gray-100 overflow-hidden">
                            <Image
                              src={property.image}
                              alt={property.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Mobile Logo Box Overlay */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/80 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest text-center p-2">
                              {property.title}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
