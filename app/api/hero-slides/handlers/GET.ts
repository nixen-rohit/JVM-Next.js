// app/api/hero-slides/handlers/GET.ts
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { rowToSlide, SlideRow } from '../helpers';
import { isValidUUID } from '../validators';

export async function handleGET(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single slide
    if (id) {
      if (!isValidUUID(id)) {
        return NextResponse.json({ error: 'Invalid slide ID format' }, { status: 400 });
      }
      
      
      
      const [rows] = await pool.query<SlideRow[]>(
        'SELECT * FROM slides WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (!rows.length) {
        return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
      }
      
      const slide = rowToSlide(rows[0]);
      // ❌ DELETE this line: serverCache.set(cacheKey, slide, 60);
      return NextResponse.json(slide);
    }
    
    // Get all slides (active first, then all for admin)
    const showAll = searchParams.get('all') === 'true';
    
   
    
    const query = showAll
      ? 'SELECT * FROM slides ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC';
    
    const [rows] = await pool.query<SlideRow[]>(query);
    const slides = rows.map(rowToSlide);
    
   
    
    return NextResponse.json({ slides, count: slides.length });
  } catch (error: any) {
    console.error('GET /api/hero-slides error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch slides',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}