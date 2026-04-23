"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Types
interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  avatar: string;
}

// Expanded Sample Data
const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "The buying process was seamless and transparent. They helped us find our absolute dream home while negotiating a fantastic price.",
    name: "Priya Sharma",
    role: "Homeowner",
    avatar: "/profile.jpg",
  },
  {
    id: 2,
    text: "A truly professional team that understands the luxury market. Their guidance was invaluable in expanding our real estate portfolio.",
    name: "Rahul Desai",
    role: "Property Investor",
    avatar: "/profile.jpg",
  },
  {
    id: 3,
    text: "Incredibly supportive and knowledgeable. They made navigating the local real estate market easy, even for a first-time buyer.",
    name: "Ananya Patel",
    role: "First-Time Buyer",
    avatar: "/profile.jpg",
  },
  {
    id: 4,
    text: "Since investing in their commercial plots, our returns have exceeded expectations. The location and development quality are unmatched.",
    name: "Vikram Singh",
    role: "Commercial Investor",
    avatar: "/profile.jpg",
  },
  {
    id: 5,
    text: "Their dedication to clients is phenomenal. Whenever we had a question about the property or paperwork, their agents answered immediately.",
    name: "Kavita Reddy",
    role: "Community Resident",
    avatar: "/profile.jpg",
  },
  {
    id: 6,
    text: "Easily the best investment we've made. The modern amenities are spectacular, and our property value has already appreciated significantly.",
    name: "Amit Verma",
    role: "Luxury Villa Owner",
    avatar: "/profile.jpg",
  },
];
export default function Review() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate card width and visible cards for responsive sliding
  useEffect(() => {
    const updateDimensions = () => {
      if (cardRef.current) {
        // Card width + the 32px gap (gap-8)
        setSlideWidth(cardRef.current.offsetWidth + 32);
      }

      // Determine how many cards are visible based on screen size
      if (window.innerWidth < 768) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    updateDimensions();
    // Small delay on initial load to ensure fonts/layout are rendered before calculating width
    setTimeout(updateDimensions, 100);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCards);

  // Navigation Logic
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-360 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-2xl font-serif text-gray-500 mb-4 uppercase tracking-wider">
              Testimonials
            </p>
            {/* Increased heading size */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black tracking-tight">
              People love us, you know.
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-4 mb-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-4 rounded-full border-2 border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 
                ${currentIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-black hover:bg-gray-100"}`}
              aria-label="Previous testimonial"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className={`p-4 rounded-full border-2 border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 
                ${currentIndex === maxIndex ? "text-gray-300 cursor-not-allowed" : "text-black hover:bg-gray-100"}`}
              aria-label="Next testimonial"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="w-full overflow-hidden py-4">
          <motion.div
            animate={{ x: -(currentIndex * slideWidth) }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            className="flex gap-8" /* Increased gap between cards */
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                ref={index === 0 ? cardRef : null}
                /* Increased padding (p-10), added minimum height, adjusted gap calculation (calc(33.333%-21.33px)) */
                className="flex flex-col justify-between shrink-0 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)] min-h-100 bg-gray-50 border border-gray-200 rounded-3xl p-10 md:p-12 shadow-sm"
              >
                {/* Increased text size to text-xl/2xl */}
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed tracking-wide mb-12">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="flex items-center gap-5 mt-auto">
                  {/* Increased avatar size to 64px (w-16 h-16) */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-gray-200 shadow-inner">
                    <Image
                      src={testimonial.avatar}
                      alt={`${testimonial.name}'s avatar`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    {/* Increased name and role sizes */}
                    <h4 className="text-lg font-bold text-black">
                      {testimonial.name}
                    </h4>
                    <p className="text-base text-gray-500 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
