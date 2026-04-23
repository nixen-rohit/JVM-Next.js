//app/components/HeroSlider.tsx

"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GoDotFill } from "react-icons/go";
import Loader from "./Loader";
import type { Slide } from "@/types/slides";
import {
  FALLBACK_SLIDE,
  isFallbackSlide,
  getDisplaySlides,
} from "@/lib/fallback-slide";

interface HeroSliderProps {
  slides?: Slide[];
}

const SLIDE_DURATION = 6000;


// Add memo for slide content to prevent unnecessary re-renders
const SlideContent = memo(({ slide, isActive }: { slide: Slide; isActive: boolean }) => {
  if (!isActive) return null;
  
  const isFallback = isFallbackSlide(slide);
  
  return (
    <>
      {isFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-black">
          <div className="text-center px-6 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white/90 mb-4">
              {slide.heading}
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg">
              Check back soon for exciting new projects.
            </p>
          </div>
        </div>
      ) : slide.useImage && slide.imageUrl ? (
        slide.imageUrl.startsWith("data:image") ? (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-green-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt}
              role="img"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 animate-fade-in"
              loading="eager"
              decoding="async"
              onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
              onError={(e) => {
                console.warn("Failed to load Base64 image:", slide.id);
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <Image
            src={slide.imageUrl}
            alt={slide.imageAlt}
            fill
            priority={true}
            className="object-cover object-center"
            sizes="100vw"
            draggable={false}
          />
        )
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-green-950" />
      )}
      
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/50 to-transparent" />
    </>
  );
});

SlideContent.displayName = 'SlideContent';

export default function HeroSlider({ slides: propSlides }: HeroSliderProps) {
  const [slides, setSlides] = useState<Slide[]>(propSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!propSlides);

  useEffect(() => {
    if (!propSlides) {
      const abortController = new AbortController();

      const fetchSlides = async () => {
        try {
          const response = await fetch("/api/hero-slides", {
            signal: abortController.signal,
          });
          if (response.ok) {
            const data = await response.json();
            setSlides(getDisplaySlides(data.slides || []));
            setCurrentIndex(0);
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Failed to fetch slides:", error);
            setSlides([FALLBACK_SLIDE]);
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsLoading(false);
          }
        }
      };

      fetchSlides();
      return () => abortController.abort(); // Cleanup
    } else {
      setSlides(getDisplaySlides(propSlides));
      setCurrentIndex(0);
      setIsLoading(false);
    }
  }, [propSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  if (!slides.length) return null;

  const currentSlide = slides[currentIndex];
  const isFallback = isFallbackSlide(currentSlide);
  const realSlides = slides.filter((s) => !isFallbackSlide(s));

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background Slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide.id}
            initial={{ x: "100%", opacity: 1 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "-100%", opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="absolute inset-0"
          >
            {isFallback ? (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-black">
                <div className="text-center px-6 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white/90 mb-4">
                    {currentSlide.heading}
                  </h1>
                  <p className="text-zinc-400 text-base sm:text-lg">
                    Check back soon for exciting new projects.
                  </p>
                </div>
              </div>
            ) : currentSlide.useImage && currentSlide.imageUrl ? (
              // 🖼️ Check if imageUrl is a Base64 data URI
              currentSlide.imageUrl.startsWith("data:image") ? (
                // Base64/BLOB image: use standard <img> tag
                <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-green-950">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imageAlt}
                    role="img"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0 animate-fade-in"
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                    decoding={currentIndex === 0 ? "sync" : "async"}
                    fetchPriority={currentIndex === 0 ? "high" : "auto"}
                    onLoad={(e) =>
                      e.currentTarget.classList.remove("opacity-0")
                    }
                    onError={(e) => {
                      console.warn(
                        "⚠️ Failed to load Base64 image:",
                        currentSlide.id,
                      );
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                // External URL: use Next.js Image for optimization
                <Image
                  src={currentSlide.imageUrl}
                  alt={currentSlide.imageAlt}
                  fill
                  priority={currentIndex === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                  draggable={false}
                />
              )
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-green-950" />
            )}

            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      {!isFallback && (
        <div className="absolute h-auto inset-0 z-10 flex items-center justify-center px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl text-center space-y-4 sm:space-y-5"
            >
              {currentSlide.showHeading && currentSlide.heading && (
                <h1 className="text-5xl md:text-7xl lg:text-8xl  font-serif font-extrabold tracking-wide text-white drop-shadow-xl leading-tight">
                  {currentSlide.heading}
                </h1>
              )}

              {currentSlide.showTag && currentSlide.tag && (
                <div className="mx-auto w-fit flex items-center justify-center gap-2 text-white/90 font-medium tracking-widest text-xs sm:text-sm md:text-base uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                  <GoDotFill className="text-white" />
                  <span>{currentSlide.tag}</span>
                </div>
              )}

              {currentSlide.showButtons && currentSlide.buttonCount > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {currentSlide.buttons
                    .slice(0, currentSlide.buttonCount)
                    .map((btn, index) => (
                      <motion.a
                        key={index}
                        href={btn.link}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full sm:w-auto px-6 sm:px-7 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg transition-all duration-300 ${
                          btn.variant === "primary"
                            ? "bg-white text-black hover:bg-zinc-200"
                            : "bg-black/50 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {btn.text || "Button"}
                      </motion.a>
                    ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Dots / Progress */}
      {!isFallback && realSlides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-2 sm:gap-3 px-4">
          {realSlides.map((slide, index) => (
            <button
              key={slide.id ?? index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-1 w-8 sm:w-12 md:w-16 overflow-hidden rounded-full transition-colors ${
                currentIndex === index
                  ? "bg-white/40"
                  : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {currentIndex === index && (
                <motion.div
                  key={`progress-${slide.id ?? index}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: SLIDE_DURATION / 1000,
                    ease: "linear",
                  }}
                  style={{ originX: 0 }}
                  className="absolute inset-0 bg-white"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
