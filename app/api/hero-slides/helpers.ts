// app/api/hero-slides/helpers.ts - NEW FILE
import { RowDataPacket } from 'mysql2/promise';
import getPool from '@/lib/db';
import type { ButtonConfig } from '@/types/slides';

export interface SlideRow extends RowDataPacket {
  id: string;
  use_image: number;
  // image_data: Buffer | null;
  // image_mime_type: string | null;
  image_alt: string;
  show_heading: number;
  heading: string | null;
  show_tag: number;
  tag: string | null;
  show_buttons: number;
  button_count: number;
  button1_text: string | null;
  button1_link: string | null;
  button1_variant: 'primary' | 'secondary';
  button2_text: string | null;
  button2_link: string | null;
  button2_variant: 'primary' | 'secondary';
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Convert buffer to base64 for client delivery
export function bufferToBase64(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Convert base64 to buffer for storage
export function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } | null {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}

// Convert database row to API response
export function rowToSlide(row: SlideRow): any {
  const buttons: ButtonConfig[] = [];
  
  if (row.button_count >= 1 && row.button1_text) {
    buttons.push({
      text: row.button1_text,
      link: row.button1_link || '#',
      variant: row.button1_variant,
    });
  }
  if (row.button_count === 2 && row.button2_text) {
    buttons.push({
      text: row.button2_text,
      link: row.button2_link || '#',
      variant: row.button2_variant,
    });
  }

  // Return WITHOUT imageUrl (images come from separate endpoint)
  return {
    id: row.id,
    useImage: row.use_image === 1,
    imageAlt: row.image_alt,
    showHeading: row.show_heading === 1,
    heading: row.heading,
    showTag: row.show_tag === 1,
    tag: row.tag,
    showButtons: row.show_buttons === 1,
    buttonCount: row.button_count as 0 | 1 | 2,
    buttons,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    version: row.version || 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Check if slide can be deleted (prevent last active slide)
export async function canDeleteSlide(slideId: string, isActive: boolean): Promise<{ allowed: boolean; reason?: string }> {
  if (!isActive) return { allowed: true };
  
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    'SELECT COUNT(*) as count FROM slides WHERE is_active = 1 AND id != ?',
    [slideId]
  );
  
  if (rows[0].count === 0) {
    return { allowed: false, reason: 'Cannot delete the only active slide. Please activate another slide first.' };
  }
  
  return { allowed: true };
}