// app/api/hero-image/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const device = searchParams.get('device') || 'desktop';
    const requestedVersion = searchParams.get('v');
    
    // Build query based on whether version is requested
    let query: string;
    let queryParams: any[];
    
    if (requestedVersion) {
      // Fetch specific version (for cache busting)
      query = `
        SELECT image_data, mime_type, version 
        FROM slide_images 
        WHERE slide_id = ? AND device_type = ? AND version = ? AND is_active = TRUE
      `;
      queryParams = [id, device, parseInt(requestedVersion)];
    } else {
      // Fetch latest active version
      query = `
        SELECT image_data, mime_type, version 
        FROM slide_images 
        WHERE slide_id = ? AND device_type = ? AND is_active = TRUE
        ORDER BY version DESC
        LIMIT 1
      `;
      queryParams = [id, device];
    }
    
    const [images] = await dbQuery<RowDataPacket[]>(query, queryParams);
    
    if (!images || images.length === 0) {
      console.log(`Image not found: ${id}, device: ${device}, version: ${requestedVersion || 'latest'}`);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const image = images[0];
    const etag = `hero-${id}-${device}-v${image.version}`;
    
    // Check cache
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }
    
    // Return image with proper headers
    return new NextResponse(image.image_data, {
      headers: {
        'Content-Type': image.mime_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'Content-Length': image.image_data.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving hero image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}