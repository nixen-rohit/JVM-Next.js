"use client";
import type { Variants } from "framer-motion";

import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Building2, BarChart3, Target, Users } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const stats = [
  {
    icon: Building2,
    title: "GROW",
    description: "with India's trusted real estate",
  },
  {
    icon: BarChart3,
    title: "LEARN",
    description: "from experienced leaders and experts",
  },
  {
    icon: Users,
    title: "EARN",
    description: "attractive rewards and performance",
  },
  {
    icon: Target,
    title: "MAKE AN IMPACT",
    description: "by delivering quality projects that create value",
  },
];

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function BuildingClipArt() {
  return (
    <Image
      height={1000}
      width={1000}
      src="/human.png"
      alt="building"
      className="h-full w-full object-cover"
    />
  );
}

function GridPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/**
 * DiagonalAccent: hidden on mobile (< lg) so the image never overlaps text.
 * On lg+ it occupies the right half with the diagonal clip.
 */
function DiagonalAccent() {
  return (
    <div
      className="hidden lg:block absolute top-0 right-0 h-full w-1/2 pointer-events-none overflow-hidden"
      style={{ clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <BuildingClipArt />
      <GridPattern />
    </div>
  );
}

export default function CareerHeader() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <main
      className="min-h-screen bg-[#0d1526] text-white overflow-x-hidden"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        <GridPattern />
        <DiagonalAccent />

        {/* Glow — constrained so they don't overflow on mobile */}
        <div className="absolute top-1/3 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full bg-[#C9A84C]/10 blur-[80px] lg:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full bg-blue-500/10 blur-[60px] lg:blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 w-full py-20 sm:py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            /* On lg+, content only occupies the left half so the image is visible */
            className="w-full lg:max-w-2xl"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeLeft}
              className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.02] mb-3 sm:mb-4   "
            >
              <span className="text-white">Build Your</span>
              <br />
              <span className="text-[#C9A84C]">Career</span>
            </motion.h1>

            <motion.h2
              variants={fadeLeft}
              className="text-3xl sm:text-4xl lg:text-6xl font-black text-white/20 mb-6 sm:mb-8 leading-none"
            >
              In Real Estate
            </motion.h2>

            {/* Divider */}
            <motion.div
              variants={fadeLeft}
              className="flex items-center gap-4 mb-6 sm:mb-8"
            >
              <div className="h-px w-10 sm:w-12 bg-[#C9A84C] shrink-0" />
              <p className="sans text-[#C9A84C] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase font-medium leading-tight">
                Shape Spaces · Create Value · Build Your Future
              </p>
            </motion.div>

            {/* Body */}
            <motion.p
              variants={fadeLeft}
              className="sans text-white/60 text-sm sm:text-base leading-relaxed max-w-md mb-8 sm:mb-10"
            >
              At{" "}
              <span className="text-[#C9A84C] font-semibold">
                JMV Developers
              </span>
              , we believe our people are our greatest asset. Join a team of
              passionate professionals and build a rewarding career in one of
              India's most dynamic industries.
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={fadeLeft}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <Link href="/contact">
                <button className="sans group relative px-6 sm:px-8 py-3 sm:py-4 bg-[#C9A84C] text-[#0d1526] font-bold text-xs sm:text-sm tracking-widest uppercase rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  <span className="relative z-10">Contact Us</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] skew-x-[-20deg] transition-transform duration-500" />
                </button>
              </Link>

              <Link href="/">
                <button className="sans px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-white/60 text-xs sm:text-sm tracking-widest uppercase rounded-full hover:border-[#C9A84C]/50 hover:text-white transition-colors duration-300">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats grid ── */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          // Border logic:
          //   mobile 2-col:  right border on col 0, bottom border on rows 0–1 (indices 0,1,2,3 → bottom on 0 and 1)
          //   lg 4-col:      right border on all except last; no bottom border
          const borderClasses = [
            // right border between columns
            "border-r border-white/10",           // index 0 — always has right border
            "",                                    // index 1 — no right on mobile (last col), yes on lg
            "border-r border-white/10",           // index 2 — always has right border
            "",                                    // index 3 — never right border
          ];

          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`
                relative flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 group
                ${index < 2 ? "border-b border-white/10 lg:border-b-0" : ""}
                ${index === 0 ? "border-r border-white/10" : ""}
                ${index === 1 ? "lg:border-r lg:border-white/10" : ""}
                ${index === 2 ? "border-r border-white/10" : ""}
              `}
            >
              <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/5 transition-all duration-300 group-hover:scale-110 group-hover:border-[#c89b3c]/60">
                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#c89b3c]" strokeWidth={1.8} />
              </div>

              <h3 className="text-sm sm:text-base lg:text-xl font-bold tracking-wide text-white mb-1 sm:mb-2">
                {stat.title}
              </h3>

              <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-300 max-w-[180px] sm:max-w-[220px]">
                {stat.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  );
}