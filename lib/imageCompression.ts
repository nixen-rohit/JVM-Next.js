// lib/imageCompression.ts
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  initialQuality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    return await imageCompression(file, config);
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function getFileType(file: File): 'image' | 'pdf' | 'other' {
  if (isImageFile(file)) return 'image';
  if (isPdfFile(file)) return 'pdf';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 25, allowedTypes = ['image/*', 'application/pdf'] } = options;
  
  // Check file type
  const typeMatch = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });
  
  if (!typeMatch) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File too large (${formatFileSize(file.size)} > ${maxSizeMB}MB)` };
  }
  
  return { valid: true };
}