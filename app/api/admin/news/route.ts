// app/api/admin/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { dbExecute, dbQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";
import { processNewsImage, validateNewsImage } from "@/lib/newsImageProcessor";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string || null;
    const source = formData.get('source') as string || null;
    const published_date = formData.get('published_date') as string;
    const is_published = formData.get('is_published') === 'true';
    const imageFile = formData.get('image') as File | null;
    
    // ✅ Log all form data
    console.log('📝 Form Data Received:', {
      title,
      category,
      content: content?.substring(0, 50),
      source,
      published_date,
      is_published,
      hasImage: !!imageFile,
      imageFileName: imageFile?.name,
      imageFileType: imageFile?.type,
      imageFileSize: imageFile?.size,
    });
    
    if (!title || !category || !published_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const id = randomUUID();
    let slug = generateSlug(title);
    
    // Ensure unique slug
    let counter = 1;
    let existing = await dbQuery<RowDataPacket[]>(
      "SELECT id FROM news_articles WHERE slug = ?",
      [slug]
    );
    while (existing[0]?.length > 0) {
      slug = `${generateSlug(title)}-${counter++}`;
      existing = await dbQuery<RowDataPacket[]>(
        "SELECT id FROM news_articles WHERE slug = ?",
        [slug]
      );
    }
    
    // Get max sort order
    const [maxOrder] = await dbQuery<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM news_articles"
    );
    const sortOrder = maxOrder[0]?.next_order || 0;
    
    // Insert article
    await dbExecute(
      `INSERT INTO news_articles (
        id, title, slug, category, content, source, 
        published_date, is_published, sort_order, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, title, slug, category, content, source, published_date, is_published ? 1 : 0, sortOrder]
    );
    
    console.log('✅ Article inserted:', id);
    
    // Process and store image if provided
    if (imageFile) {
      console.log('📸 Processing image...');
      
      const validation = validateNewsImage(imageFile);
      console.log('📸 Validation result:', validation);
      
      if (!validation.valid) {
        await dbExecute("DELETE FROM news_articles WHERE id = ?", [id]);
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      
      try {
        const processed = await processNewsImage(imageFile);
        console.log('📸 Image processed:', {
          bufferSize: processed.imageBuffer.length,
          mimeType: processed.mimeType,
          width: processed.metadata.width,
          height: processed.metadata.height,
        });
        
        await dbExecute(
          `INSERT INTO news_images (id, news_id, image_data, mime_type, blur_data, width, height, version)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [randomUUID(), id, processed.imageBuffer, processed.mimeType, processed.blurData, processed.metadata.width, processed.metadata.height]
        );
        
        console.log(`✅ Image saved for news_id: ${id}`);
        
        // Verify image was saved
        const [checkImage] = await dbQuery<RowDataPacket[]>(
          "SELECT id FROM news_images WHERE news_id = ?",
          [id]
        );
        console.log('📸 Verification:', checkImage[0]?.length > 0 ? 'Image found' : 'Image NOT found');
        
      } catch (error) {
        console.error('❌ Image processing failed:', error);
        await dbExecute("DELETE FROM news_articles WHERE id = ?", [id]);
        return NextResponse.json({ error: "Failed to process image" }, { status: 400 });
      }
    } else {
      console.log('⚠️ No image file provided');
    }
    
    return NextResponse.json({ 
      success: true, 
      id, 
      slug,
      message: "Article created successfully" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

 


export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
     
 const [articles] = await dbQuery<RowDataPacket[]>(
      `SELECT 
        a.id, a.title, a.slug, a.category, a.content, a.source, 
        a.published_date, a.is_published, a.sort_order, a.version,
        a.created_at, a.updated_at,
        CASE WHEN i.id IS NOT NULL THEN TRUE ELSE FALSE END as has_image
       FROM news_articles a
       LEFT JOIN news_images i ON a.id = i.news_id
       ORDER BY a.sort_order ASC, a.published_date DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const [countResult] = await dbQuery<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM news_articles"
    );
    
    return NextResponse.json({
      articles,
      total: countResult[0]?.total || 0,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
