// app/admin/hero-slides/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GoPlus, GoPencil, GoCheck, GoAlert, GoInfo } from "react-icons/go";
import { GoStack, GoPulse } from "react-icons/go";
import Image from "next/image";
import type { Slide, ButtonConfig } from "@/types/slides";
import {
  FALLBACK_SLIDE,
  FALLBACK_SLIDE_ID,
  isFallbackSlide,
} from "@/lib/fallback-slide";

export default function HeroSlidesList() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hero-slides");

      if (!response.ok) throw new Error("Failed to fetch slides");

      const data = await response.json();
      const fetchedSlides: Slide[] = data.slides || [];

      // 🔥 FALLBACK: Inject fallback slide if no real slides exist
      if (fetchedSlides.length === 0) {
        setSlides([FALLBACK_SLIDE]);
      } else {
        setSlides(fetchedSlides);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/admin/hero-slides/new");
    // Dispatch event to refresh when returning
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hero-slides-updated"));
    }
  };
  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-600 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400">Loading slides...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4 p-6 bg-red-900/20 rounded-xl border border-red-700/50">
          <GoAlert className="mx-auto text-3xl text-red-400" />
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchSlides}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}

      <header className="border-b border-green-700/50 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Slides Manager
          </h1>

          <div className="flex items-center gap-4">
            {/* Slide Stats */}

            <div className="hidden sm:flex items-center px-5 py-2 rounded-2xl bg-[#0b0f0d] border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.08)]">
              <p className="text-base font-semibold text-white">
                Total:{" "}
                <span className="text-green-400 font-bold">
                  {slides.filter((s) => !isFallbackSlide(s)).length}
                </span>
              </p>
            </div>

            <AnimatePresence>
              {actionMessage && (
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg ${
                    actionMessage.type === "success"
                      ? "bg-green-900/50 text-green-400 border border-green-700/50"
                      : "bg-red-900/50 text-red-400 border border-red-700/50"
                  }`}
                >
                  {actionMessage.type === "success" ? <GoCheck /> : <GoAlert />}
                  {actionMessage.text}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-green-900/30"
            >
              <GoPlus size={18} />
              New Slide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slides.map((slide, index) => {
            const isFallback = isFallbackSlide(slide);

            return (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative rounded-xl border overflow-hidden transition-colors ${
                  isFallback
                    ? "bg-zinc-900/30 border-zinc-700/50"
                    : "bg-zinc-900/50 border-green-700/30 hover:border-green-600/50"
                }`}
              >
                {/* Thumbnail */}
                <div className="block aspect-video relative bg-zinc-950">
                  {isFallback ? (
                    /* Fallback Slide Preview */
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-black via-zinc-900 to-black">
                      <div className="text-center px-6">
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-white/80 mb-2">
                          {slide.heading}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Add your first project to replace this
                        </p>
                      </div>
                    </div>
                  ) : slide.useImage ? (
                    // ✅ Use the new image endpoint
                    <img
                      src={`/api/hero-slides/image/${slide.id}?device=desktop&v=${slide.version || 1}&t=${Date.now()}`}
                      alt={slide.imageAlt || "Slide preview"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // If image fails to load, show fallback
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "absolute inset-0 bg-linear-to-br from-zinc-800 via-zinc-900 to-green-950 flex items-center justify-center";
                          fallback.innerHTML =
                            '<span class="text-zinc-600 text-sm">No Image</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-zinc-800 via-zinc-900 to-green-950 flex items-center justify-center">
                      <span className="text-zinc-600 text-sm">No Image</span>
                    </div>
                  )}

                  {/* Hover Overlay - Only for real slides */}
                  {!isFallback && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/hero-slides/${slide.id}`}
                        className="flex justify-center items-center  p-2 bg-green-700 hover:bg-green-600 rounded-lg transition-colors z-10"
                        title="Edit slide"
                      >
                        <GoPencil size={16} />
                      </Link>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {isFallback ? (
                      <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs font-medium rounded-full flex items-center gap-1">
                        <GoInfo size={10} /> Fallback
                      </span>
                    ) : (
                      slide.isActive && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full">
                          Active
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        className={`font-semibold truncate ${isFallback ? "text-zinc-400" : "text-white"}`}
                      >
                        {slide.heading || "Untitled Slide"}
                      </h3>
                      {slide.tag && !isFallback && (
                        <p className="text-xs text-zinc-500 uppercase tracking-wider truncate">
                          {slide.tag}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Button Preview */}
                  {!isFallback &&
                    slide.showButtons &&
                    slide.buttonCount > 0 &&
                    slide.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {slide.buttons
                          .slice(0, slide.buttonCount)
                          .map((btn: ButtonConfig, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                btn.variant === "primary"
                                  ? "bg-white text-black"
                                  : "bg-zinc-700 text-white border border-zinc-600"
                              }`}
                            >
                              {btn.text || "Button"}
                            </span>
                          ))}
                      </div>
                    )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>#{index + 1}</span>
                    {!isFallback && slide.updatedAt && (
                      <span>
                        Updated {new Date(slide.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fallback Notice */}
        {slides.length === 1 && isFallbackSlide(slides[0]) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700/50 flex items-start gap-3"
          >
            <GoInfo className="text-green-400 mt-0.5 shrink-0" />
            <div className="text-sm text-zinc-400">
              <p className="font-medium text-zinc-300 mb-1">
                Fallback Slide Active
              </p>
              <p>
                This placeholder slide shows when no projects are published.
                Click <strong className="text-green-400">"New Slide"</strong>{" "}
                above to add your first project and replace this message.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
