// app/api/hero-slides/handlers/PUT.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { rowToSlide, SlideRow, base64ToBuffer } from '../helpers';
import { isValidUUID } from '../validators';

const MAX_IMAGE_SIZE_MB = 1;

export async function handlePUT(request: NextRequest) {
  let connection;
  
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Slide ID required in URL' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid slide ID format' }, { status: 400 });
    }
    
    const updates = await request.json();
    
    // Start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Check if slide exists
    const [existing] = await connection.query<SlideRow[]>(
      'SELECT * FROM slides WHERE id = ? FOR UPDATE',
      [id]
    );
    
    if (!existing.length) {
      await connection.rollback();
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.useImage !== undefined) {
      updateFields.push('use_image = ?');
      values.push(updates.useImage ? 1 : 0);
    }
    
    if (updates.imageData !== undefined) {
      if (updates.useImage === false || !updates.imageData) {
        updateFields.push('image_data = NULL, image_mime_type = NULL');
      } else {
        const parsed = base64ToBuffer(updates.imageData);
        if (parsed) {
          if (parsed.buffer.length > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            await connection.rollback();
            return NextResponse.json(
              { error: `Image too large. Max ${MAX_IMAGE_SIZE_MB}MB.` },
              { status: 400 }
            );
          }
          updateFields.push('image_data = ?, image_mime_type = ?');
          values.push(parsed.buffer, parsed.mimeType);
        }
      }
    }
    
    if (updates.imageAlt !== undefined) {
      updateFields.push('image_alt = ?');
      values.push(updates.imageAlt);
    }
    
    if (updates.showHeading !== undefined) {
      updateFields.push('show_heading = ?');
      values.push(updates.showHeading ? 1 : 0);
    }
    
    if (updates.heading !== undefined) {
      updateFields.push('heading = ?');
      values.push(updates.heading);
    }
    
    if (updates.showTag !== undefined) {
      updateFields.push('show_tag = ?');
      values.push(updates.showTag ? 1 : 0);
    }
    
    if (updates.tag !== undefined) {
      updateFields.push('tag = ?');
      values.push(updates.tag);
    }
    
    if (updates.showButtons !== undefined) {
      updateFields.push('show_buttons = ?');
      values.push(updates.showButtons ? 1 : 0);
    }
    
    if (updates.buttonCount !== undefined) {
      updateFields.push('button_count = ?');
      values.push(updates.buttonCount);
    }
    
    if (updates.buttons) {
      if (updates.buttons[0]) {
        updateFields.push('button1_text = ?, button1_link = ?, button1_variant = ?');
        values.push(updates.buttons[0].text, updates.buttons[0].link, updates.buttons[0].variant);
      }
      if (updates.buttonCount === 2 && updates.buttons[1]) {
        updateFields.push('button2_text = ?, button2_link = ?, button2_variant = ?');
        values.push(updates.buttons[1].text, updates.buttons[1].link, updates.buttons[1].variant);
      } else if (updates.buttonCount === 1) {
        updateFields.push('button2_text = NULL, button2_link = NULL, button2_variant = "secondary"');
      }
    }
    
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = ?');
      values.push(updates.isActive ? 1 : 0);
    }
    
    if (updates.sortOrder !== undefined) {
      updateFields.push('sort_order = ?');
      values.push(updates.sortOrder);
    }
    
    if (updateFields.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateFields.push('updated_at = NOW()');
    values.push(id);
    
    await connection.query(
      `UPDATE slides SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    await connection.commit();
    
     
    
    // Fetch updated slide
    const [rows] = await pool.query<SlideRow[]>(
      'SELECT * FROM slides WHERE id = ? LIMIT 1',
      [id]
    );
    
    return NextResponse.json(rowToSlide(rows[0]));
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('PUT /api/hero-slides error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update slide',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}