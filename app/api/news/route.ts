// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        n.id, 
        n.title, 
        n.slug, 
        CASE 
          WHEN n.category = 'press_media' THEN 'Press Media'
          ELSE 'Blog'
        END as category_label,
        n.category,
        n.source,
        DATE_FORMAT(n.published_date, '%M %d, %Y') as formatted_date,
        n.published_date,
        n.sort_order,
        n.version,
        CASE WHEN ni.id IS NOT NULL THEN TRUE ELSE FALSE END as image_exists
      FROM news_articles n
      LEFT JOIN news_images ni ON n.id = ni.news_id
      WHERE n.is_published = 1
    `;
    
    const params: any[] = [];
    
    if (category && category !== 'All') {
      const dbCategory = category === 'Press Media' ? 'press_media' : 'blog';
      query += ` AND n.category = ?`;
      params.push(dbCategory);
    }
    
    query += ` ORDER BY n.sort_order ASC, n.published_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [articles] = await dbQuery<RowDataPacket[]>(query, params);
    
    // Get total count
    const [countResult] = await dbQuery<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM news_articles WHERE is_published = 1",
      []
    );
    
    return NextResponse.json({
      articles,
      total: countResult[0]?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}