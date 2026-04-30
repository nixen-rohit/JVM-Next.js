// app/api/hero-slides/handlers/GET.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import { serverCache, ACTIVE_SLIDES_CACHE_KEY, getSlideCacheKey } from '@/lib/cache';
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
      
      // Check cache first
      const cacheKey = getSlideCacheKey(id);
      const cachedSlide = serverCache.get(cacheKey);
      if (cachedSlide) {
        return NextResponse.json(cachedSlide);
      }
      
      const [rows] = await pool.query<SlideRow[]>(
        'SELECT * FROM slides WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (!rows.length) {
        return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
      }
      
      const slide = rowToSlide(rows[0]);
      serverCache.set(cacheKey, slide, 60); // Cache for 60 seconds
      return NextResponse.json(slide);
    }
    
    // Get all slides (active first, then all for admin)
    const showAll = searchParams.get('all') === 'true';
    
    if (!showAll) {
      // Check cache for active slides
      const cachedSlides = serverCache.get(ACTIVE_SLIDES_CACHE_KEY);
      if (cachedSlides) {
        return NextResponse.json(cachedSlides);
      }
    }
    
    const query = showAll
      ? 'SELECT * FROM slides ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC';
    
    const [rows] = await pool.query<SlideRow[]>(query);
    const slides = rows.map(rowToSlide);
    
    // Cache active slides only
    if (!showAll) {
      serverCache.set(ACTIVE_SLIDES_CACHE_KEY, { slides, count: slides.length }, 60);
    }
    
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