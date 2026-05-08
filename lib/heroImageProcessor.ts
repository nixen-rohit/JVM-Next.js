// lib/heroImageProcessor.ts
import sharp from 'sharp';

export interface ProcessedHeroImage {
  desktopBuffer: Buffer;
  mobileBuffer: Buffer;
  blurData: string;
  desktopMetadata: { width: number; height: number };
  mobileMetadata: { width: number; height: number };
}

export async function processHeroImage(file: File): Promise<ProcessedHeroImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Desktop: 1920x800 WebP quality 78
  const desktopBuffer = await sharp(buffer)
    .resize(1920, 800, { fit: 'cover', position: 'center' })
    .webp({ quality: 78 })
    .toBuffer();
  
  // Mobile: 768x900 WebP quality 72
  const mobileBuffer = await sharp(buffer)
    .resize(768, 900, { fit: 'cover', position: 'center' })
    .webp({ quality: 72 })
    .toBuffer();
  
  // Blur: 20x20 for placeholder
  const blurBuffer = await sharp(buffer)
    .resize(20, 20, { fit: 'cover' })
    .webp({ quality: 20 })
    .toBuffer();
  
  const blurData = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
  
  const desktopMetadata = await sharp(desktopBuffer).metadata();
  const mobileMetadata = await sharp(mobileBuffer).metadata();
  
  return {
    desktopBuffer,
    mobileBuffer,
    blurData,
    desktopMetadata: {
      width: desktopMetadata.width || 1920,
      height: desktopMetadata.height || 800,
    },
    mobileMetadata: {
      width: mobileMetadata.width || 768,
      height: mobileMetadata.height || 900,
    },
  };
}