"use client";

import React, { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

// --- Types ---
interface VerticalCard {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  color: string;
}

// --- Data ---
const verticals: VerticalCard[] = [
  {
    id: 1,
    category: "INFRASTRUCTURE",
    title: "Expressway Safety Upgrades",
    description:
      "Upgrading Yamuna Expressway with modern LED lights and secure crash barriers.",
    image: "/news1.jpg",
    color: "from-gray-900 to-transparent",
  },
  {
    id: 2,
    category: "AVIATION",
    title: "Greater Noida Jewar Airport",
    description:
      "The highly anticipated Jewar International Airport is rapidly becoming reality.",
    image: "/news2.jpg",
    color: "from-gray-900 to-transparent",
  },
  {
    id: 3,
    category: "INSTITUTIONAL",
    title: "Strategic CRPF Base Campus",
    description:
      "Allocating 30 prime acres along the Yamuna Expressway for a new CRPF base.",
    image: "/news3.jpg",
    color: "from-blue-900 to-transparent",
  },
  {
    id: 4,
    category: "EXPANSION",
    title: "Successful Land Acquisition",
    description:
      "Over 118 property owners have officially agreed to support the airport growth.",
    image: "/news4.jpg",
    color: "from-gray-900 to-transparent",
  },
  {
    id: 5,
    category: "AGRICULTURE",
    title: "JMV Developers Farm Estates",
    description:
      "Discover premium agricultural spaces exclusively managed by JMV Developers.",
    image: "/news5.jpg",
    color: "from-gray-900 to-transparent",
  },
];

// --- Heading Animation Variants ---
const headingVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const subheadingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

export default function News() {
  // Default to the first card being active for a better initial mobile experience
  const [activeId, setActiveId] = useState<number | null>(1);

  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden font-sans">
      {/* HEADING SECTION */}
      {/* Added flex, flex-col, items-center, and text-center to center the content */}
      <div className="relative z-20 px-6 md:px-10 pt-16 pb-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-serif text-white tracking-tight"
          variants={headingVariants}
          initial="hidden"
          animate="visible"
        >
          News & <span className="font-serif italic text-amber-500">Feeds</span>
        </motion.h1>

        <motion.p
          className="text-neutral-400 text-lg md:text-xl mt-3 max-w-2xl"
          variants={subheadingVariants}
          initial="hidden"
          animate="visible"
        >
          See our recent posts.
        </motion.p>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row w-full min-h-[75vh] md:h-[85vh] px-6 md:px-10 pb-12 gap-3 md:gap-0">
        {verticals.map((card) => {
          const isActive = activeId === card.id;

          return (
            <motion.div
              layout
              key={card.id}
              className={`relative overflow-hidden cursor-pointer group rounded-2xl md:rounded-none transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? "h-95 md:h-full md:flex-[3_3_0%]"
                    : "h-25 md:h-full md:flex-[1_1_0%]"
                }
              `}
              onMouseEnter={() => setActiveId(card.id)}
              onClick={() => setActiveId(isActive ? null : card.id)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* Background Image */}
              <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out
                  ${isActive ? "grayscale-0 scale-105" : "grayscale scale-100"}
                `}
                style={{ backgroundImage: `url(${card.image})` }}
              />

              {/* Overlay Gradient */}
              <div
                className={`absolute inset-0 bg-linear-to-t ${card.color} opacity-80 md:opacity-60 md:group-hover:opacity-40 transition-opacity duration-500`}
              />

              {/* Content Container */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                {/* Top Label */}
                <span
                  className={`text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500
                  ${isActive ? "opacity-100 translate-y-0" : "opacity-70"}
                `}
                >
                  {card.category}
                </span>

                {/* Bottom Details */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex flex-col justify-end"
                    >
                      <h2 className="text-2xl md:text-3xl text-white font-semibold mb-2 leading-tight">
                        {card.title}
                      </h2>
                      <p className="text-gray-200 text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-none">
                        {card.description}
                      </p>

                      {/* Read More Button */}
                      <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white w-fit px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-colors duration-300">
                        READ MORE
                        <FiArrowRight className="text-xs md:text-sm" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}