"use client";
import type { Variants } from "framer-motion";
import React from "react";
import { motion } from "framer-motion";
import { Mail, Users, TrendingUp, ShieldCheck, Award } from "lucide-react";

// Types for our core values
interface CoreValue {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const coreValues: CoreValue[] = [
  { icon: Users, title: "PEOPLE FIRST CULTURE" },
  { icon: TrendingUp, title: "CONTINUOUS GROWTH" },
  { icon: ShieldCheck, title: "INTEGRITY & TRUST" },
  { icon: Award, title: "QUALITY EXCELLENCE" },
];

export default function CareerStats() {
  // Framer Motion Animation Variants
  const containerVariants : Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants:Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full bg-[#0d1526] text-white font-sans relative overflow-hidden border-t-4 border-[#d4af37] ">
      <motion.div
        className="max-w-7xl mx-auto px-6 py-8 flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10 "
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Left Section: Call to Action */}
        <motion.div
          className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#e5c158] to-[#b8860b] shadow-lg shadow-yellow-500/10 shrink-0">
            <Mail className="w-5 h-5 text-[#0a1d37]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-[#d4af37] uppercase mb-0.5">
              Ready to take the next step?
            </p>
            <p className="text-sm text-gray-300">
              Send your resume to{" "}
              <a
                href="mailto:info@jmvdevelopers.com"
                className="font-bold text-white hover:text-[#d4af37] transition-colors duration-200 block sm:inline"
              >
                info@jmvdevelopers.com
              </a>
            </p>
          </div>
        </motion.div>

        {/* Center Section: Core Values */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full xl:w-auto"
        >
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group cursor-pointer px-2"
            >
              <div className="flex items-center justify-center mb-2">
                <value.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4af37] transition-transform duration-300 group-hover:scale-110" />
              </div>

              <span className="font-semibold text-white hover:text-[#d4af37] transition-colors duration-200 ">
                {value.title}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Right Section: Slogan */}
        <motion.div
          className="text-center   uppercase   font-medium   text-sm sm:text-base border-t xl:border-t-0 border-gray-700/50 pt-6 xl:pt-0 w-full xl:w-auto"
          variants={itemVariants}
        >
          <p className="text-gray-300 ">Building better communities.</p>
          <p className="text-gray-400">
            Building{" "}
            <span className="text-[#d4af37] font-bold">better careers.</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
