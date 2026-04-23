// types/slides.ts

export interface ButtonConfig {
  text: string;
  link: string;
  variant: "primary" | "secondary";
}

export interface Slide {
  id: string;
  useImage: boolean;
  imageUrl: string | null; // External URL or file path
  imageAlt: string;
  
  // 🔹 SERVER-ONLY: Binary image data from MySQL
  // Use imageBase64 for client rendering
  imageBlob?: Buffer | Uint8Array | null;
  imageMimeType?: string | null; // e.g., "image/jpeg"
  
  // 🔹 CLIENT-SAFE: Base64 data URI for <img> or next/image
  imageBase64?: string | null; // "data:image/jpeg;base64,..."
  
  showHeading: boolean;
  heading: string | null;
  showTag: boolean;
  tag: string | null;
  showButtons: boolean;
  buttonCount: 0 | 1 | 2; // API can return 0 for fallback
  buttons: ButtonConfig[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlideConfig extends Omit<Slide, "buttonCount"> {
  // 🔹 CLIENT-ONLY: UI restricts to 1 or 2 buttons
  buttonCount: 1 | 2;
  
  /** 
   * 🔹 CLIENT-ONLY: Raw File from upload input 
   * Convert to base64 before sending to API
   */
  imageFile: File | null;
  
  /** 
   * 🔹 CLIENT-ONLY: Preview URL (ObjectURL or base64)
   */
  imagePreview: string | null;
}

export interface SlideListResponse {
  slides: Slide[];
  count: number;
}

export interface SlideApiResponse {
  error?: string;
  details?: string;
  message?: string;
  data?: Slide; // ✅ Simplified
}