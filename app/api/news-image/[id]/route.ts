// app/api/news-image/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const version = searchParams.get('v');
    
    console.log(`🔍 Fetching image for news_id: ${id}, version: ${version}`);
    
    let query = `
      SELECT ni.image_data, ni.mime_type, ni.version, n.title
      FROM news_images ni
      JOIN news_articles n ON ni.news_id = n.id
      WHERE ni.news_id = ?
    `;
    
    const queryParams: any[] = [id];
    
    if (version) {
      query += ` AND ni.version = ?`;
      queryParams.push(parseInt(version));
    }
    
    query += ` LIMIT 1`;
    
    const [images] = await dbQuery<RowDataPacket[]>(query, queryParams);
    
    if (!images || images.length === 0) {
      console.log(`❌ No image found for news_id: ${id}`);
      // Return 204 No Content instead of SVG to avoid Image component issues
      return new NextResponse(null, { status: 204 });
    }
    
    const image = images[0];
    const etag = `news-${id}-v${image.version || 1}`;
    
    // Check cache
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }
    
    console.log(`✅ Returning image for ${image.title}, size: ${image.image_data.length}`);
    
    return new NextResponse(image.image_data, {
      headers: {
        'Content-Type': image.mime_type || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'Content-Length': image.image_data.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving news image:', error);
    return new NextResponse(null, { status: 204 });
  }
}