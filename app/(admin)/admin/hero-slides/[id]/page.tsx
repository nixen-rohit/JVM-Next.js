//app/(admin)/admin/hero-slides/[id]/page.tsx

"use client";

import { useState, useRef, ChangeEvent, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "framer-motion";
import {
  GoArrowLeft,
  GoDotFill,
  GoUpload,
  GoTrash,
  GoPlus,
  GoX,
  GoCheck,
  GoAlert,
} from "react-icons/go";

import type { Slide, ButtonConfig, SlideConfig } from "@/types/slides";
import {
  FALLBACK_SLIDE,
  FALLBACK_SLIDE_ID,
  isFallbackSlide,
} from "@/lib/fallback-slide";

// ─────────────────────────────────────────────────────────────
// 🛠️ HELPER: Normalize slide state to prevent buttonCount/buttons mismatch
// ─────────────────────────────────────────────────────────────
const normalizeSlide = (slide: SlideConfig): SlideConfig => {
  const validButtons = slide.buttons.filter(Boolean);
  const buttonCount = Math.min(Math.max(slide.buttonCount ?? 1, 1), 2) as 1 | 2;

  // Ensure buttons array matches buttonCount
  let normalizedButtons = [...validButtons];
  if (normalizedButtons.length < buttonCount) {
    // Add default buttons if missing
    while (normalizedButtons.length < buttonCount) {
      normalizedButtons.push({
        text: "New Button",
        link: "#",
        variant:
          buttonCount === 1
            ? "primary"
            : normalizedButtons.length === 0
              ? "primary"
              : "secondary",
      });
    }
  } else if (normalizedButtons.length > buttonCount) {
    // Trim excess buttons
    normalizedButtons = normalizedButtons.slice(0, buttonCount);
  }

  return {
    ...slide,
    buttonCount,
    buttons: normalizedButtons,
  };
};

const createNewSlide = (): SlideConfig => {
  const base: SlideConfig = {
    id: crypto.randomUUID(),
    useImage: true,
    imageUrl: null,
    imageAlt: "Hero slide",
    showHeading: true,
    heading: "JMV Developers",
    showTag: true,
    tag: "REAL ESTATE DEVELOPMENT COMPANY",
    showButtons: true,
    buttonCount: 1,
    buttons: [{ text: "About Us", link: "/about", variant: "primary" }],
    isActive: true,
    sortOrder: 0,
    imageFile: null,
    imagePreview: null,
  };
  return normalizeSlide(base);
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function EditHeroSlide() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [slide, setSlide] = useState<SlideConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 🔴 NEW: Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSlide = useDebounce(slide, 100);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // 🔒 Store preview URL in ref for reliable cleanup (Fix #4)
  const previewUrlRef = useRef<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNewSlide = params.id === "new";
  const isFallback = slide ? isFallbackSlide(slide) : false;

  useEffect(() => {
    if (!isNewSlide) {
      fetchSlide(params.id);
    } else {
      setSlide(createNewSlide());
      setIsLoading(false);
    }
  }, [params.id, isNewSlide]);

  // 🔒 Cleanup object URLs on unmount (Fix #4 - improved)
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const fetchSlide = async (id: string) => {
    try {
      if (id === FALLBACK_SLIDE_ID) {
        setSlide(
          normalizeSlide({
            ...FALLBACK_SLIDE,
            buttonCount: 1,
            imageFile: null,
            imagePreview: null,
          } as SlideConfig),
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/hero-slides?id=${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch slide");
      }

      const data: Slide = await response.json();

      // ✅ Explicitly map Slide → SlideConfig with all required fields
      const slideConfig: SlideConfig = {
        // Required SlideConfig fields (UI state)
        id: data.id,
        imageFile: null,
        imagePreview: null,

        // Mapped from API Slide type
        useImage: data.useImage ?? true,
        imageUrl: data.imageUrl ?? null,
        imageAlt: data.imageAlt ?? "Hero slide",
        showHeading: data.showHeading ?? true,
        heading: data.heading ?? "",
        showTag: data.showTag ?? true,
        tag: data.tag ?? "",
        showButtons: data.showButtons ?? true,
        buttonCount: (data.buttonCount === 0 ? 1 : (data.buttonCount ?? 1)) as
          | 1
          | 2,
        buttons: data.buttons?.length
          ? data.buttons.map((btn) => ({
              text: btn.text ?? "",
              link: btn.link ?? "#",
              variant: btn.variant ?? "primary",
            }))
          : [{ text: "About Us", link: "/about", variant: "primary" }],
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      };

      setSlide(normalizeSlide(slideConfig));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load slide";
      setSaveError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔒 Use callback to ensure latest state in updates
  const updateSlide = useCallback((updates: Partial<SlideConfig>) => {
    setSlide((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updates };
      // 🔒 Always normalize after updates (Fix #1)
      return normalizeSlide(merged);
    });
  }, []);

  // Add this helper function inside your component or import from lib
  const validateAndCompressImage = async (
    file: File,
    maxSizeMB: number = 1,
  ): Promise<{ success: boolean; file?: File; error?: string }> => {
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      // Try to compress
      try {
        const options = {
          maxSizeMB: maxSizeMB - 0.1, // Slightly under limit
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.85,
        };

        const compressedFile = await imageCompression(file, options);
        const compressedSizeMB = compressedFile.size / (1024 * 1024);

        if (compressedSizeMB > maxSizeMB) {
          return {
            success: false,
            error: `Image too large (${fileSizeMB.toFixed(1)}MB). Please upload an image smaller than ${maxSizeMB}MB or manually compress it.`,
          };
        }

        return { success: true, file: compressedFile };
      } catch (error) {
        return {
          success: false,
          error: `Failed to compress image. Please upload an image smaller than ${maxSizeMB}MB.`,
        };
      }
    }

    // File is already under limit, but still compress for optimization
    try {
      const options = {
        maxSizeMB: maxSizeMB - 0.1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.9,
      };
      const compressedFile = await imageCompression(file, options);
      return { success: true, file: compressedFile };
    } catch (error) {
      // If compression fails, use original
      return { success: true, file };
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 🖼️ IMAGE HANDLERS (Fix #4: Memory leak prevention)
  // ─────────────────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      return;
    }

    setIsProcessingImage(true);

    try {
      // Compress ONCE
      const result = await validateAndCompressImage(file, 1);

      if (!result.success || !result.file) {
        throw new Error(result.error || "Failed to process image");
      }

      // Store the compressed file directly
      const compressedFile = result.file;

      // Create preview from compressed file
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      previewUrlRef.current = objectUrl;

      // Store compressed file and preview
      updateSlide({
        imageFile: compressedFile, // Store compressed file
        imagePreview: objectUrl,
        // Don't convert to base64 yet - do it only on save
        imageUrl: null,
      });
    } catch (error) {
      console.error("Image processing failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try a smaller image (max 1MB).",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    // 🔒 Revoke preview URL when removing (Fix #4)
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    updateSlide({ imageFile: null, imagePreview: null, imageUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  // Add this function before handleSave
const compressAndConvertToBase64 = async (file: File): Promise<string> => {
  try {
    // Compression options
    const options = {
      maxSizeMB: 0.8, // Target under 1MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);

    console.log('🗜️ Compression:', {
      original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      saved: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
    });

    // Convert compressed file to Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('❌ Compression failed, falling back to original:', error);
    // Fallback: compress failed, use original file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
};

  // ─────────────────────────────────────────────────────────────
  // 🔘 BUTTON HANDLERS (Fix #2 & #3: Safety checks)
  // ─────────────────────────────────────────────────────────────
  const updateButton = useCallback(
    (index: number, field: keyof ButtonConfig, value: string) => {
      setSlide((prev) => {
        if (!prev) return null;

        // 🔒 Bounds check (Fix #3)
        if (index < 0 || index >= prev.buttons.length) {
          console.warn(`updateButton: index ${index} out of bounds`);
          return prev;
        }

        const existingButton = prev.buttons[index];
        // 🔒 Provide default if button is undefined (Fix #3)
        const buttonToUpdate = existingButton ?? {
          text: "",
          link: "#",
          variant: index === 0 ? "primary" : "secondary",
        };

        const newButtons = [...prev.buttons];
        newButtons[index] = { ...buttonToUpdate, [field]: value };

        return normalizeSlide({ ...prev, buttons: newButtons });
      });
    },
    [],
  );

  const addSecondButton = useCallback(() => {
    setSlide((prev) => {
      if (!prev) return null;

      // 🔒 Ensure we don't exceed max buttons
      if (prev.buttonCount >= 2) return prev;

      const newButton: ButtonConfig = {
        text: "New Button",
        link: "#",
        variant: "secondary",
      };

      return normalizeSlide({
        ...prev,
        buttonCount: 2,
        buttons: [...prev.buttons, newButton],
      });
    });
  }, []);

  const removeButton = useCallback((index: number) => {
    setSlide((prev) => {
      if (!prev) return null;

      // 🔒 Bounds check (Fix #2)
      if (index < 0 || index >= prev.buttons.length) {
        console.warn(`removeButton: index ${index} out of bounds`);
        return prev;
      }

      // 🔒 Always keep at least 1 button (Fix #2)
      if (prev.buttons.length <= 1) {
        return normalizeSlide({ ...prev, buttonCount: 1 });
      }

      const newButtons = prev.buttons.filter((_, i) => i !== index);

      return normalizeSlide({
        ...prev,
        buttonCount: newButtons.length === 1 ? 1 : 2,
        buttons: newButtons,
      });
    });
  }, []);

 
const handleSave = async () => {
  if (isSaving || !slide || isFallback) {
    console.log('Save prevented:', { isSaving, hasSlide: !!slide, isFallback });
    return;
  }

  setIsSaving(true);
  setSaveError(null);
  setSaveSuccess(false);

  try {
    // Validate button links and text before sending
    const normalized = normalizeSlide(slide);


    
    for (const btn of normalized.buttons) {
      if (!btn.link || (!btn.link.startsWith('/') && !btn.link.startsWith('http') && btn.link !== '#')) {
        throw new Error(`Invalid button link: ${btn.link}`);
      }
      if (!btn.text || btn.text.trim().length === 0) {
        throw new Error('Button text cannot be empty');
      }
    }

    // 🖼️ IMAGE HANDLING: Convert to Base64 for BLOB storage
    let imageData: string | null = null;
    
    if (normalized.useImage) {
      if (normalized.imageFile) {
        // New image uploaded - compress and convert to Base64
        imageData = await compressAndConvertToBase64(normalized.imageFile);
      } else if (normalized.imageUrl && normalized.imageUrl.startsWith('data:image')) {
        // Already a Base64 string (from previous save or preview)
        imageData = normalized.imageUrl;
      } else if (normalized.imageUrl && !normalized.imageUrl.startsWith('data:image')) {
        // This is a URL from server (shouldn't happen for new uploads, but keep for compatibility)
        // For existing slides, we don't need to send the image again
        imageData = null;
      }
    }

    // Prepare payload matching API expectations
    const payload = {
      id: normalized.id,
      useImage: normalized.useImage,
      imageData: imageData, // ⚠️ Note: field name is 'imageData', not 'imageUrl'
      imageAlt: normalized.imageAlt,
      showHeading: normalized.showHeading,
      heading: normalized.heading,
      showTag: normalized.showTag,
      tag: normalized.tag,
      showButtons: normalized.showButtons,
      buttonCount: normalized.buttonCount,
      buttons: normalized.buttons.map(btn => ({
        text: btn.text,
        link: btn.link,
        variant: btn.variant
      })),
      isActive: normalized.isActive,
      sortOrder: normalized.sortOrder,
    };

    console.log('Saving payload:', { 
      ...payload, 
      imageData: payload.imageData ? `${payload.imageData.substring(0, 100)}...` : null 
    });

    

    const isNew = isNewSlide;
    const method = isNew ? "POST" : "PUT";
    const url = isNew
      ? "/api/hero-slides"
      : `/api/hero-slides?id=${normalized.id}`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.error || error.details || "Failed to save slide");
    }

    const saved: Slide = await response.json();

    // Map response back to SlideConfig
    const savedConfig: SlideConfig = {
      id: saved.id,
      imageFile: null,
      imagePreview: null,
      useImage: saved.useImage ?? true,
      imageUrl: saved.imageUrl ?? null,
      imageAlt: saved.imageAlt ?? "Hero slide",
      showHeading: saved.showHeading ?? true,
      heading: saved.heading ?? "",
      showTag: saved.showTag ?? true,
      tag: saved.tag ?? "",
      showButtons: saved.showButtons ?? true,
      buttonCount: (saved.buttonCount === 0 ? 1 : (saved.buttonCount ?? 1)) as 1 | 2,
      buttons: saved.buttons?.length
        ? saved.buttons.map((btn) => ({
            text: btn.text ?? "",
            link: btn.link ?? "#",
            variant: btn.variant ?? "primary",
          }))
        : [{ text: "About Us", link: "/about", variant: "primary" }],
      isActive: saved.isActive ?? true,
      sortOrder: saved.sortOrder ?? 0,
    };

    setSlide(normalizeSlide(savedConfig));
    setSaveSuccess(true);

    // Invalidate cache by refreshing
    setTimeout(() => {
      router.push('/admin/hero-slides');
      router.refresh();
    }, 1200);


    console.log('Sending to API:', {
  method,
  url,
  hasImageData: !!payload.imageData,
  imageDataLength: payload.imageData?.length,
  useImage: payload.useImage,
  buttonCount: payload.buttonCount,
});
    
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Save error:", err);
    setSaveError(message);
  } finally {
    setIsSaving(false);
  }
};

  // 🔴 UPDATED: Delete with beautiful modal (no NODE_ENV check)
  const openDeleteConfirm = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    if (!slide || isNewSlide || isFallback) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/hero-slides?id=${slide.id}&hard=true`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete slide");
      }

      router.push("/admin/hero-slides");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      console.error("Delete error:", err);
      setSaveError(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-600 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400">Loading slide...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!slide) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4 p-6 bg-red-900/20 rounded-xl border border-red-700/50">
          <GoAlert className="mx-auto text-3xl text-red-400" />
          <p className="text-red-300">Slide not found</p>
          <Link
            href="/admin/hero-slides"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
          >
            <GoArrowLeft size={16} />
            Back to Slides
          </Link>
        </div>
      </div>
    );
  }

  // 🔒 Safe preview URL getter (Fix #5)
  const getPreviewSrc = (): string | null => {
    if (slide.imagePreview) return slide.imagePreview;
    if (slide.imageUrl) return slide.imageUrl;
    if (slide.imageData) return slide.imageData; // ← Add fallback
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="border-b border-green-700/50 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/hero-slides"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Back to slides list"
            >
              <GoArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-green-400">
                {isNewSlide
                  ? "Create New Slide"
                  : isFallback
                    ? "Fallback Slide"
                    : "Edit Slide"}
              </h1>
              <p className="text-xs text-zinc-500">
                {slide.heading || "Untitled Slide"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saveSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1.5 text-sm text-green-400"
                >
                  <GoCheck className="text-lg" />
                  {isNewSlide ? "Created!" : "Saved!"}
                </motion.span>
              )}
              {saveError && (
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1.5 text-sm text-red-400"
                >
                  <GoAlert className="text-lg" />
                  {saveError}
                </motion.span>
              )}
            </AnimatePresence>

            {!isNewSlide && !isFallback && (
              <button
                onClick={openDeleteConfirm}
                disabled={isSaving || isDeleting}
                title="Delete slide"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-300 hover:shadow-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Delete</span>
                <GoTrash
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || isFallback}
              className={`px-5 py-2.5 font-semibold rounded-lg transition-colors shadow-lg shadow-green-900/30 flex items-center gap-2 ${
                isSaving || isFallback
                  ? "bg-green-800 text-green-200 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-600 text-white"
              }`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : isFallback ? (
                "Read-Only"
              ) : isNewSlide ? (
                "Create Slide"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fallback Warning Banner */}
      {isFallback && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl flex items-start gap-3">
            <GoAlert className="text-amber-400 mt-0.5 shrink-0" size={20} />
            <div className="text-sm text-amber-200">
              <p className="font-medium mb-1">Fallback Slide (Read-Only)</p>
              <p className="text-amber-300/80">
                This is a system placeholder shown when no projects exist. Click{" "}
                <strong className="text-amber-200">"New Slide"</strong> in the
                list view to create your first project.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div
            className={`space-y-6 ${isFallback ? "opacity-50 pointer-events-none" : ""}`}
          >
            {/* Image Section */}
            <section className="bg-zinc-900/50 rounded-xl p-5 border border-green-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-400">
                  Background Image
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-zinc-400">Use Image</span>
                  <input
                    type="checkbox"
                    checked={slide.useImage}
                    onChange={(e) =>
                      updateSlide({ useImage: e.target.checked })
                    }
                    disabled={isFallback}
                    className="w-5 h-5 rounded border-green-600 bg-zinc-800 text-green-600 focus:ring-green-500 focus:ring-offset-zinc-900 disabled:opacity-50"
                  />
                </label>
              </div>

              <AnimatePresence>
                {slide.useImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Image upload area - Always rendered, but conditionally styled/disabled */}
                    <div
                      onDrop={slide.useImage ? handleDrop : undefined}
                      onDragOver={slide.useImage ? handleDragOver : undefined}
                      onDragLeave={slide.useImage ? handleDragLeave : undefined}
                      onClick={() => {
                        if (!isFallback && slide.useImage && !isSaving) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isFallback ? "cursor-not-allowed" : ""
                      } ${
                        !slide.useImage
                          ? "opacity-50 bg-zinc-900/30 border-zinc-700 cursor-not-allowed"
                          : isDragging
                            ? "border-green-500 bg-green-900/20 cursor-pointer"
                            : getPreviewSrc()
                              ? "border-green-700/50 bg-zinc-800/50 cursor-pointer"
                              : "border-zinc-700 hover:border-green-600 hover:bg-zinc-800/30 cursor-pointer"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isSaving || isFallback || !slide.useImage}
                      />

                      {/* Show disabled overlay when useImage is false */}
                      {!slide.useImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <p className="text-zinc-400 text-sm">
                            Image upload disabled
                          </p>
                        </div>
                      )}

                      {/* Loading overlay for image processing */}
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-green-600 border-t-white rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-white text-sm">
                              Processing image...
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Preview or upload area */}
                      {getPreviewSrc() ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                          <Image
                            src={getPreviewSrc()!}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          {!isFallback && slide.useImage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isSaving && !isProcessingImage)
                                  removeImage();
                              }}
                              disabled={
                                isSaving || isFallback || isProcessingImage
                              }
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-full text-white shadow-lg transition-colors"
                            >
                              <GoX size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <GoUpload
                            className={`mx-auto text-3xl ${slide.useImage ? "text-green-500" : "text-zinc-600"}`}
                          />
                          <div>
                            <p
                              className={`font-medium ${slide.useImage ? "text-green-400" : "text-zinc-500"}`}
                            >
                              {slide.useImage
                                ? "Click or drag image here"
                                : "Image upload disabled"}
                            </p>
                            {slide.useImage && (
                              <p className="text-xs text-zinc-500 mt-1">
                                16:9 recommended • Max 1MB (automatically
                                compressed)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Heading */}
            <section className="bg-zinc-900/50 rounded-xl p-5 border border-green-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-400">
                  Main Heading
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-zinc-400">Show</span>
                  <input
                    type="checkbox"
                    checked={slide.showHeading}
                    onChange={(e) =>
                      updateSlide({ showHeading: e.target.checked })
                    }
                    disabled={isFallback}
                    className="w-5 h-5 rounded border-green-600 bg-zinc-800 text-green-600 focus:ring-green-500 disabled:opacity-50"
                  />
                </label>
              </div>
              {slide.showHeading && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="text"
                  value={slide.heading || ""}
                  onChange={(e) => updateSlide({ heading: e.target.value })}
                  placeholder="Enter heading..."
                  disabled={isSaving || isFallback}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-600 text-white disabled:opacity-50"
                />
              )}
            </section>

            {/* Tag */}
            <section className="bg-zinc-900/50 rounded-xl p-5 border border-green-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-400">
                  Tag / Subtitle
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-zinc-400">Show</span>
                  <input
                    type="checkbox"
                    checked={slide.showTag}
                    onChange={(e) => updateSlide({ showTag: e.target.checked })}
                    disabled={isFallback}
                    className="w-5 h-5 rounded border-green-600 bg-zinc-800 text-green-600 focus:ring-green-500 disabled:opacity-50"
                  />
                </label>
              </div>
              {slide.showTag && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="text"
                  value={slide.tag || ""}
                  onChange={(e) => updateSlide({ tag: e.target.value })}
                  placeholder="Enter tag..."
                  disabled={isSaving || isFallback}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-600 text-white uppercase tracking-wider disabled:opacity-50"
                />
              )}
            </section>

            {/* Buttons */}
            <section className="bg-zinc-900/50 rounded-xl p-5 border border-green-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-400">
                  Call-to-Action Buttons
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-zinc-400">Show</span>
                  <input
                    type="checkbox"
                    checked={slide.showButtons}
                    onChange={(e) =>
                      updateSlide({ showButtons: e.target.checked })
                    }
                    disabled={isFallback}
                    className="w-5 h-5 rounded border-green-600 bg-zinc-800 text-green-600 focus:ring-green-500 disabled:opacity-50"
                  />
                </label>
              </div>

              <AnimatePresence>
                {slide.showButtons && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3">
                      {[1, 2].map((count) => (
                        <button
                          key={count}
                          onClick={() =>
                            !isFallback &&
                            updateSlide({
                              buttonCount: count as 1 | 2,
                              // 🔒 Buttons array is normalized automatically (Fix #1)
                            })
                          }
                          disabled={isSaving || isFallback}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            slide.buttonCount === count
                              ? "bg-green-700 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {count} Button{count !== 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>

                    {slide.buttons
                      .slice(0, slide.buttonCount)
                      .map((btn, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-400">
                              Button {index + 1}
                            </span>
                            {slide.buttonCount === 2 && !isFallback && (
                              <button
                                onClick={() => removeButton(index)}
                                disabled={isSaving}
                                className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                                title="Remove button"
                              >
                                <GoTrash size={16} />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={btn?.text ?? ""}
                            onChange={(e) =>
                              updateButton(index, "text", e.target.value)
                            }
                            placeholder="Button text..."
                            disabled={isSaving || isFallback}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:ring-2 focus:ring-green-600 text-sm disabled:opacity-50"
                          />
                          <input
                            type="text"
                            value={btn?.link ?? ""}
                            onChange={(e) =>
                              updateButton(index, "link", e.target.value)
                            }
                            placeholder="Link URL..."
                            disabled={isSaving || isFallback}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:ring-2 focus:ring-green-600 text-sm disabled:opacity-50"
                          />
                          <div className="flex gap-2">
                            {(["primary", "secondary"] as const).map(
                              (variant) => (
                                <button
                                  key={variant}
                                  onClick={() =>
                                    !isFallback &&
                                    updateButton(index, "variant", variant)
                                  }
                                  disabled={isSaving || isFallback}
                                  className={`flex-1 py-1.5 px-3 rounded text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                                    btn?.variant === variant
                                      ? variant === "primary"
                                        ? "bg-white text-black"
                                        : "bg-zinc-700 text-white border border-zinc-600"
                                      : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
                                  }`}
                                >
                                  {variant}
                                </button>
                              ),
                            )}
                          </div>
                        </motion.div>
                      ))}

                    {slide.buttonCount === 1 && !isFallback && (
                      <button
                        onClick={addSecondButton}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors"
                      >
                        <GoPlus size={16} />
                        Add Second Button
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-zinc-900 rounded-xl border border-green-700/30 overflow-hidden">
              <div className="px-5 py-4 border-b border-green-700/30 bg-black/30">
                <h3 className="font-semibold text-green-400">Live Preview</h3>
                <p className="text-xs text-zinc-500">
                  Desktop view • 1920×1080
                </p>
              </div>

              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                {/* 🔒 Safe image rendering with proper null checks (Fix #5) */}
                {slide.useImage && getPreviewSrc() ? (
                  <Image
                    src={getPreviewSrc()!}
                    alt="Preview background"
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      console.error("Failed to load image preview");
                      e.currentTarget.style.display = "none";
                      // Optionally show fallback
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-green-950" />
                )}

                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-16">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${slide.heading}-${slide.tag}-${slide.buttonCount}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 max-w-3xl"
                    >
                      {slide.showHeading && slide.heading && (
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-wide drop-shadow-xl">
                          {slide.heading}
                        </h1>
                      )}
                      {slide.showTag && slide.tag && (
                        <div className="flex items-center justify-center gap-2 text-white/90 font-medium tracking-widest text-xs md:text-sm uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                          <GoDotFill className="text-lg text-green-400" />
                          <span>{slide.tag}</span>
                        </div>
                      )}
                      {slide.showButtons && slide.buttonCount > 0 && (
                        <div
                          className={`mt-6 flex ${
                            slide.buttonCount === 1
                              ? "justify-center"
                              : "flex-col sm:flex-row gap-4 justify-center"
                          }`}
                        >
                          {slide.buttons
                            .slice(0, slide.buttonCount)
                            .filter(Boolean) // 🔒 Filter out undefined buttons (Fix #3)
                            .map((btn, index) => (
                              <button
                                key={index}
                                className={`px-7 py-3 rounded-full font-semibold text-sm tracking-wide transition-all shadow-lg ${
                                  btn.variant === "primary"
                                    ? "bg-white text-black hover:bg-zinc-200"
                                    : "bg-black/50 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black"
                                }`}
                              >
                                {btn.text || "Button"}
                              </button>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-700/90 text-xs font-medium rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <p>• Toggle sections to show/hide fields</p>
              <p>• Preview updates in real-time</p>
              <p>• Click "Save Changes" to persist</p>
              <p>• Use ← to return to slides list</p>
            </div>
          </div>
        </div>
      </main>

      {/* 🔴 Universal Delete Confirmation Modal — Works in Local & Production */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete Slide
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  This action cannot be undone. The slide and its background
                  image will be permanently removed from the database.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-sm hover:shadow-red-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete permanently"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
