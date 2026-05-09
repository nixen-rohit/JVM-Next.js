// components/project/KeyFeatures.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface FeatureItem {
  id: string;
  text: string;
}

interface KeyFeaturesProps {
  heading?: string;
  paragraph?: string;
  features?: FeatureItem[];
  isEnabled?: boolean;
}

export function KeyFeatures({
  heading,
  paragraph,
  features,
  isEnabled,
}: KeyFeaturesProps) {
  // Don't render if section is disabled
  if (!isEnabled) return null;

  // Don't render if no heading and no features
  if (!heading && (!features || features.length === 0)) return null;

  // Filter out empty features
  const validFeatures =
    features?.filter((f) => f.text && f.text.trim() !== "") || [];

  return (
   <section className="min-h-screen bg-zinc-300 py-16 px-4 sm:px-6">
  <div className="max-w-7xl mx-auto">
    
    {/* Header Section */}
    {(heading || paragraph) && (
      <div className="text-center mb-12 max-w-3xl mx-auto">
        {heading && (
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {heading}
          </h2>
        )}

        {paragraph && (
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {paragraph}
          </p>
        )}
      </div>
    )}

    {/* Features Grid */}
    {validFeatures.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {validFeatures.map((feature, index) => (
          <motion.div
            key={feature.id || index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group h-full"
          >
            {/* Icon */}
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 shrink-0 group-hover:scale-110 transition-transform duration-300" />

            {/* Text */}
            <span className="text-gray-700 leading-relaxed wrap-break-word">
              {feature.text}
            </span>
          </motion.div>
        ))}
      </div>
    )}

  </div>
</section>
  );
}
