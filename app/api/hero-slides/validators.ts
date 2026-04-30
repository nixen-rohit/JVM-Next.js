// app/api/hero-slides/validators.ts
import { z } from 'zod';

export const ButtonSchema = z.object({
  text: z.string().min(1, 'Button text is required'),
  link: z.string().min(1, 'Button link is required'),
  variant: z.enum(['primary', 'secondary']),
});

// More flexible schema that accepts both imageUrl and imageData
export const SlideSchema = z.object({
  id: z.string().uuid('Invalid slide ID format'),
  useImage: z.boolean().default(true),
  imageUrl: z.string().nullable().optional(), // For backward compatibility
  imageData: z.string().nullable().optional(), // New field
  imageAlt: z.string().default('Hero slide background'),
  showHeading: z.boolean().default(true),
  heading: z.string().max(255).nullable().optional(),
  showTag: z.boolean().default(true),
  tag: z.string().max(255).nullable().optional(),
  showButtons: z.boolean().default(true),
  buttonCount: z.number().min(1).max(2).default(1),
  buttons: z.array(ButtonSchema).min(1).max(2),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).transform((data) => {
  // If imageData is not provided but imageUrl is, use imageUrl as imageData
  if (!data.imageData && data.imageUrl) {
    return { ...data, imageData: data.imageUrl };
  }
  return data;
});

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}