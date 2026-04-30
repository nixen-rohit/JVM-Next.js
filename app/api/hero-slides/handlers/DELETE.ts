// app/api/hero-slides/handlers/DELETE.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { rowToSlide, SlideRow, canDeleteSlide } from '../helpers';
import { isValidUUID } from '../validators';

export async function handleDELETE(request: NextRequest) {
  let connection;
  
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hardDelete = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
    }
    
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid slide ID format' }, { status: 400 });
    }
    
    // Start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Get slide info before deletion
    const [slides] = await connection.query<SlideRow[]>(
      'SELECT * FROM slides WHERE id = ? FOR UPDATE',
      [id]
    );
    
    if (!slides.length) {
      await connection.rollback();
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    
    const slide = slides[0];
    
    if (hardDelete) {
      // Check if we can delete this slide
      const { allowed, reason } = await canDeleteSlide(id, slide.is_active === 1);
      if (!allowed) {
        await connection.rollback();
        return NextResponse.json({ error: reason }, { status: 400 });
      }
      
      // Hard delete
      await connection.query('DELETE FROM slides WHERE id = ?', [id]);
    } else {
      // Soft delete - just deactivate
      await connection.query(
        'UPDATE slides SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({
      message: hardDelete ? 'Slide permanently deleted' : 'Slide deactivated'
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('DELETE /api/hero-slides error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete slide',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}