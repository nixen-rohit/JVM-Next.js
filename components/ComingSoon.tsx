"use client";

import { Calendar, Clock, Mail } from "lucide-react";

interface ComingSoonProps {
  projectName: string;
  estimatedLaunch?: string;
  description?: string;
}

export function ComingSoon({
  projectName,
  estimatedLaunch,
  description,
}: ComingSoonProps) {
  return (
    <div className="py-16 h-screen  bg-[#030705] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Soft ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.08),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="  backdrop-blur-xl p-10 md:p-14 text-center  ">
          {/* Icon */}
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10">
              <Calendar className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-6">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs tracking-[0.18em] uppercase text-emerald-300">
              Coming Soon
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            <span className="bg-linear-to-b from-white to-emerald-200 bg-clip-text text-transparent">
              {projectName}
            </span>
          </h1>

          {/* Description */}
          {description && (
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl  mx-auto mb-8 leading-relaxed">
              {description}
            </p>
          )}

          {/* Divider */}
          <div className="w-16 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent mx-auto mb-6" />

          {/* Contact */}
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
  border hover:border-white/10 hover:bg-white/4
  hover:text-gray-300
  text-emerald-300 border-emerald-500/30 bg-emerald-500/10
  transition-all duration-300
  shadow-[0_4px_20px_rgba(0,0,0,0.4)]
  backdrop-blur-md"
          >
            <Mail className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
            <span className="tracking-wide">Contact</span>

            {/* subtle glow layer */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
          </a>
        </div>
      </div>
    </div>
  );
}
