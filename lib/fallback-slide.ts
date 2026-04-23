// lib/fallback-slide.ts
import type { Slide } from '@/types/slides';

export const FALLBACK_SLIDE_ID = 'fallback-no-projects';

export const FALLBACK_SLIDE: Slide = {
  id: FALLBACK_SLIDE_ID,
  useImage: false,
  imageUrl: null,
  imageAlt: 'No projects available',
  showHeading: true,
  heading: 'Currently No Projects',
  showTag: false,
  tag: null,
  showButtons: false,
  buttonCount: 0,
  buttons: [],
  isActive: true,
  sortOrder: 999, // Lowest priority
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const isFallbackSlide = (slide: Slide): boolean => {
  return slide.id === FALLBACK_SLIDE_ID;
};

export const getDisplaySlides = (slides: Slide[]): Slide[] => {
  // Return real slides if any exist, otherwise fallback
  const activeSlides = slides.filter(s => s.isActive && !isFallbackSlide(s));
  return activeSlides.length > 0 ? activeSlides : [FALLBACK_SLIDE];
};