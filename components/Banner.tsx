"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { FaPhoneAlt } from "react-icons/fa";

// Define animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each element animating in
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Banner() {
  return (
    <section className="w-full bg-white pb-20 flex justify-center">
      {/* The Card Container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }} // Triggers slightly before it fully enters the viewport
        variants={containerVariants}
        className="relative w-full overflow-hidden shadow-2xl bg-[#0a1e24]"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.avif"
            alt="Banner Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Dark Teal Overlay to make text readable */}
        <div className="absolute inset-0 z-10 bg-[#06181d]/70 mix-blend-multiply" />
        <div className="absolute inset-0 z-10 bg-linear-to-t from-[#06181d]/90 via-transparent to-transparent" />

        {/* Content Wrapper */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center py-24 md:py-32 px-6">
          {/* Animated Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-[1.2] max-w-4xl tracking-tight"
          >
            Do you want to talk with one of our{" "}
            <br className="hidden md:block" />
            <span className="italic font-light">real estate experts?</span>
          </motion.h2>

          {/* Animated Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-gray-200 max-w-2xl mb-12 font-light"
          >
            Get in touch with our professional team and let us help you find
            your dream property
          </motion.p>

          {/* Animated Button */}
          <motion.button
            variants={itemVariants}
            className="flex items-center gap-3 bg-white text-[#0a1e24] hover:text-white px-8 py-3.5 rounded-full text-[15px] font-bold tracking-wide hover:bg-[#f29a00] transition-transform hover:scale-105 active:scale-95 mb-16 shadow-lg"
          >
            <FaPhoneAlt size={14} />
            Call Now
          </motion.button>

          {/* Animated Bottom Features */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[11px] md:text-xs font-semibold tracking-[0.15em] text-gray-300 uppercase"
          >
            <span>Available 24/7</span>
            <span className="hidden md:block text-[#f29a00] text-xl leading-none">
              •
            </span>
            <span>Free Consultation</span>
            <span className="hidden md:block text-[#f29a00] text-xl leading-none">
              •
            </span>
            <span>Expert Advice</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
