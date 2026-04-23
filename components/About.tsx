"use client";

import { motion } from "framer-motion";

interface PrincipleCardProps {
  number: string;
  title: string;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
  hover: {
    y: -8,
    borderColor: "#f29a00",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
} as const;

const PrincipleCard: React.FC<PrincipleCardProps> = ({
  number,
  title,
  description,
}) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover="hover"
      className="group bg-white rounded-2xl p-10 border border-gray-100 cursor-default"
    >
      {/* Number and Title Container */}
      <div className="flex items-start gap-6 mb-6">
        <motion.h3
          className="text-7xl font-light text-gray-900 leading-none"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {number}
        </motion.h3>

        <div className="flex-1 pt-2">
          <motion.h4
            className="text-base font-semibold text-[#f29a00] uppercase tracking-wider leading-tight group-hover:text-[#f29a00] transition-colors duration-300"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h4>
        </div>
      </div>

      {/* Horizontal Line */}
      <motion.div
        className="w-full h-px bg-linear-to-r from-orange-400 to-transparent mb-6"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{
          scaleX: 1.02,
          backgroundColor: "#f29a00",
        }}
      />

      {/* Description */}
      <motion.p
        className="text-gray-600 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Subtle hover indicator */}
      <motion.div
        className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default function About() {
  const principles = [
    {
      number: "01",
      title: "Building the New India",
      description:
        "We are dedicated to building significantly to create the new India. Our primary goal is to become the nation's most valuable real estate company by delivering landmark projects that redefine urban living and contribute to the country's monumental growth and infrastructure.",
    },
    {
      number: "02",
      title: "Excellence & Aesthetics",
      description:
        "We strive to achieve international standards of excellence across all our developments. By maintaining an unwavering focus on superior quality, stunning aesthetics, and ultimate customer satisfaction, we ensure every project reflects our commitment to delivering world-class spaces.",
    },
    {
      number: "03",
      title: "Community & Environment",
      description:
        "We operate with profound respect for the communities and environments where we build. By strictly adhering to all legal requirements and prioritizing sustainable practices, we create responsible developments that harmonize with nature and foster long-term prosperity for everyone.",
    },
  ];

  return (
    <section className="min-h-[50vh] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2
            className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            The Principles Behind Everything We Build
          </motion.h2>

          <motion.div
            className="w-24 h-px bg-linear-to-r from-transparent via-[#f29a00] to-transparent mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {principles.map((principle) => (
            <PrincipleCard key={principle.number} {...principle} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
