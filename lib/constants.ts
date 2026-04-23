// lib/constants.ts
export const APP_CONFIG = {
  // Slider settings
  SLIDER: {
    DURATION_MS: 6000,
    ANIMATION_DURATION: 0.8,
    ANIMATION_EASE: [0.25, 0.8, 0.25, 1] as const,
  },
  
  // Image settings
  IMAGE: {
    MAX_SIZE_MB: 15,
    MAX_WIDTH: 1920,
    COMPRESSION_QUALITY: 0.8,
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  
  // Validation
  VALIDATION: {
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    MAX_BUTTONS: 2,
    MAX_BUTTON_TEXT_LENGTH: 100,
    MAX_HEADING_LENGTH: 255,
    MAX_TAG_LENGTH: 255,
  },
  
  // UI settings
  UI: {
    DEBOUNCE_DELAY_MS: 300,
    SAVE_SUCCESS_DURATION_MS: 3000,
    SAVE_ERROR_DURATION_MS: 5000,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;