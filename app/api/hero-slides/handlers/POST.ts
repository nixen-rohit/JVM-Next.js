// app/api/hero-slides/handlers/POST.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { serverCache, ACTIVE_SLIDES_CACHE_KEY, getSlideCacheKey } from '@/lib/cache';
import { rowToSlide, SlideRow, base64ToBuffer } from '../helpers';
import { SlideSchema, isValidUUID } from '../validators';

const MAX_IMAGE_SIZE_MB = 1; // 1MB limit

export async function handlePOST(request: NextRequest) {
  let connection;
  
  try {
    const pool = getPool();
    const config = await request.json();
    
    // Validate input
    const validation = SlideSchema.safeParse(config);
    if (!validation.success) {
      console.error('Validation errors:', validation.error.issues);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    if (!isValidUUID(validatedData.id)) {
      return NextResponse.json({ error: 'Invalid slide ID format' }, { status: 400 });
    }
    
    // Process image if provided
    let imageBuffer: Buffer | null = null;
    let imageMimeType: string | null = null;
    
    if (validatedData.useImage && validatedData.imageData) {
      const parsed = base64ToBuffer(validatedData.imageData);
      if (parsed) {
        // Check image size (1MB limit)
        if (parsed.buffer.length > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          return NextResponse.json(
            { error: `Image too large. Max ${MAX_IMAGE_SIZE_MB}MB.` },
            { status: 400 }
          );
        }
        imageBuffer = parsed.buffer;
        imageMimeType = parsed.mimeType;
      }
    }
    
    // Start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      `INSERT INTO slides (
        id, use_image, image_data, image_mime_type, image_alt,
        show_heading, heading, show_tag, tag,
        show_buttons, button_count,
        button1_text, button1_link, button1_variant,
        button2_text, button2_link, button2_variant,
        is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.id,
        validatedData.useImage ? 1 : 0,
        imageBuffer,
        imageMimeType,
        validatedData.imageAlt,
        validatedData.showHeading ? 1 : 0,
        validatedData.heading,
        validatedData.showTag ? 1 : 0,
        validatedData.tag,
        validatedData.showButtons ? 1 : 0,
        validatedData.buttonCount,
        validatedData.buttons[0]?.text ?? null,
        validatedData.buttons[0]?.link ?? null,
        validatedData.buttons[0]?.variant ?? 'primary',
        validatedData.buttons[1]?.text ?? null,
        validatedData.buttons[1]?.link ?? null,
        validatedData.buttons[1]?.variant ?? 'secondary',
        validatedData.isActive ? 1 : 0,
        validatedData.sortOrder,
      ]
    );
    
    await connection.commit();
    
    // Invalidate caches
    serverCache.invalidate(ACTIVE_SLIDES_CACHE_KEY);
    serverCache.invalidate(getSlideCacheKey(validatedData.id));
    
    // Fetch created slide
    const [rows] = await pool.query<SlideRow[]>(
      'SELECT * FROM slides WHERE id = ? LIMIT 1',
      [validatedData.id]
    );
    
    return NextResponse.json(rowToSlide(rows[0]), { status: 201 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('POST /api/hero-slides error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'A slide with this ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to create slide',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}