"use client";
import type { Variants } from "framer-motion";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
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
const fadeUp : Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeLeft:Variants = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeRight:Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function BuildingClipArt() {
  return (
    <Image
      height={1000}
      width={1000}
      src="/human.png"
      alt="building"
      className="h-full w-full object-cover "
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

function DiagonalAccent() {
  return (
    <div
      className="absolute top-0 right-0 h-full w-1/2 pointer-events-none overflow-hidden"
      style={{ clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <div className="absolute inset-0  " />
      <BuildingClipArt />
      <GridPattern />
    </div>
  );
}

const itemVariants:Variants = {
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

export default function CareerHeader() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <main
      className="min-h-screen bg-[#0d1526] text-white overflow-x-hidden "
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden  "
      >
        <GridPattern />
        <DiagonalAccent />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#C9A84C]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 w-full py-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeLeft}
              className="text-5xl lg:text-7xl font-black leading-[1.02] mb-4"
            >
              <span className="text-white">Build Your</span>
              <br />
              <span className="text-[#C9A84C]">Career</span>
            </motion.h1>
            <motion.h2
              variants={fadeLeft}
              className="text-4xl lg:text-6xl font-black text-white/20 mb-8 leading-none"
            >
              In Real Estate
            </motion.h2>

            {/* Divider */}
            <motion.div
              variants={fadeLeft}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-px w-12 bg-[#C9A84C]" />
              <p className="sans text-[#C9A84C] text-xs tracking-[0.25em] uppercase font-medium">
                Shape Spaces · Create Value · Build Your Future
              </p>
            </motion.div>

            {/* Body */}
            <motion.p
              variants={fadeLeft}
              className="sans text-white/60 text-base leading-relaxed max-w-md mb-10"
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
            <motion.div variants={fadeLeft} className="flex items-center gap-4">
              <Link href="/contact">
                <button className="sans group relative px-8 py-4 bg-[#C9A84C] text-[#0d1526] font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  <span className="relative z-10">Contact Us</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-110%] group-hover:translate-x-[110%] skew-x-[-20deg] transition-transform duration-500" />
                </button>
              </Link>

              <Link href="/">
                <button className="sans px-8 py-4 border border-white/20 text-white/60 text-sm tracking-widest uppercase rounded-full hover:border-[#C9A84C]/50 hover:text-white transition-colors duration-300">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 "
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative flex flex-col items-center  text-center px-8 py-8 group ${
                index !== stats.length - 1
                  ? "lg:border-r lg:border-white/10"
                  : ""
              } ${index < 2 ? "sm:border-b sm:border-white/10 lg:border-b-0" : ""}`}
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c89b3c]/30 bg-[#c89b3c]/5 transition-all duration-300 group-hover:scale-110 group-hover:border-[#c89b3c]/60">
                <Icon className="h-8 w-8 text-[#c89b3c]" strokeWidth={1.8} />
              </div>

              <h3 className="text-lg md:text-xl font-bold tracking-wide text-white mb-2">
                {stat.title}
              </h3>

              <p className="text-sm md:text-base leading-relaxed text-gray-300 max-w-[220px]">
                {stat.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  );
}
