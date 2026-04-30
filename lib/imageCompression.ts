// lib/imageCompression.ts - UPDATED
import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  initialQuality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.8, // Target slightly under 1MB
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.85,
};

// New: Validate image size before upload
export async function validateAndCompressImage(
  file: File,
  maxSizeMB: number = 1,
): Promise<{ success: boolean; file?: File; error?: string }> {
  // Check file size first
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > maxSizeMB) {
    // Try to compress
    try {
      const compressedFile = await compressImage(file, {
        maxSizeMB: maxSizeMB - 0.1, // Slightly under limit
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

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
    const compressedFile = await compressImage(file, DEFAULT_OPTIONS);
    return { success: true, file: compressedFile };
  } catch (error) {
    // If compression fails, use original
    return { success: true, file };
  }
}

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
): Promise<File> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    return await imageCompression(file, config);
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    return file;
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}


export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function getFileType(file: File): 'image' | 'pdf' | 'other' {
  if (isImageFile(file)) return 'image';
  if (isPdfFile(file)) return 'pdf';
  return 'other';
}
