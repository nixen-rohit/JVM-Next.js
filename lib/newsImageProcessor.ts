import sharp from 'sharp';

export interface ProcessedNewsImage {
  imageBuffer: Buffer;
  blurData: string;
  metadata: { width: number; height: number };
  mimeType: string;
}

export async function processNewsImage(file: File): Promise<ProcessedNewsImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  console.log(`📸 Processing image: ${file.name}, type: ${file.type}, size: ${(buffer.length / 1024).toFixed(2)}KB`);
  
  // Resize to 1200x800 WebP quality 80
  const imageBuffer = await sharp(buffer)
    .resize(1200, 800, { 
      fit: 'cover', 
      position: 'center' 
    })
    .webp({ quality: 80 })
    .toBuffer();
  
  // Generate blur placeholder (20px version)
  const blurBuffer = await sharp(buffer)
    .resize(20, 20, { fit: 'cover' })
    .webp({ quality: 20 })
    .toBuffer();
  
  const blurData = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
  
  const metadata = await sharp(imageBuffer).metadata();
  
  console.log(`✅ Processed: ${metadata.width}x${metadata.height}, ${(imageBuffer.length / 1024).toFixed(2)}KB`);
  
  return {
    imageBuffer,
    blurData,
    metadata: {
      width: metadata.width || 1200,
      height: metadata.height || 800,
    },
    mimeType: 'image/webp',
  };
}

export function validateNewsImage(file: File): { valid: boolean; error?: string } {
  // ✅ More flexible type checking
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // Check by MIME type
  let isValidType = allowedTypes.includes(file.type.toLowerCase());
  
  // If MIME type check fails, try checking by file extension
  if (!isValidType) {
    const fileName = file.name.toLowerCase();
    isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));
    console.log(`📸 File type detection: MIME=${file.type}, extension check=${isValidType}`);
  }
  
  if (!isValidType) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || 'unknown'}. Please upload JPEG, PNG, or WebP images.`
    };
  }
  
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`
    };
  }
  
  return { valid: true };
}