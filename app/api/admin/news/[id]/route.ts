// app/api/admin/news/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbQuery, dbExecute } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";
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

// ✅ GET - Fetch single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const { id } = await params;
    
    const [articles] = await dbQuery<RowDataPacket[]>(
      `SELECT 
        a.*, 
        CASE WHEN i.id IS NOT NULL THEN TRUE ELSE FALSE END as has_image
       FROM news_articles a
       LEFT JOIN news_images i ON a.id = i.news_id
       WHERE a.id = ?`,
      [id]
    );
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    
    return NextResponse.json(articles[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

// ✅ PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const { id } = await params;
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string || null;
    const source = formData.get('source') as string || null;
    const published_date = formData.get('published_date') as string;
    const is_published = formData.get('is_published') === 'true';
    const sort_order = parseInt(formData.get('sort_order') as string || '0');
    const imageFile = formData.get('image') as File | null;
    const removeImage = formData.get('remove_image') === 'true';
    
    // Check if article exists
    const [existing] = await dbQuery<RowDataPacket[]>(
      "SELECT id, version FROM news_articles WHERE id = ?",
      [id]
    );
    
    if (!existing[0]?.length) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    
    // Update slug if title changed
    let slug: string | undefined;
    if (title) {
      slug = generateSlug(title);
      let counter = 1;
      let existingSlug = await dbQuery<RowDataPacket[]>(
        "SELECT id FROM news_articles WHERE slug = ? AND id != ?",
        [slug, id]
      );
      while (existingSlug[0]?.length > 0) {
        slug = `${generateSlug(title)}-${counter++}`;
        existingSlug = await dbQuery<RowDataPacket[]>(
          "SELECT id FROM news_articles WHERE slug = ? AND id != ?",
          [slug, id]
        );
      }
    }
    
    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (title) {
      updateFields.push("title = ?");
      values.push(title);
      updateFields.push("slug = ?");
      values.push(slug);
    }
    if (category) {
      updateFields.push("category = ?");
      values.push(category);
    }
    if (content !== undefined) {
      updateFields.push("content = ?");
      values.push(content);
    }
    if (source !== undefined) {
      updateFields.push("source = ?");
      values.push(source);
    }
    if (published_date) {
      updateFields.push("published_date = ?");
      values.push(published_date);
    }
    if (is_published !== undefined) {
      updateFields.push("is_published = ?");
      values.push(is_published ? 1 : 0);
    }
    if (sort_order !== undefined) {
      updateFields.push("sort_order = ?");
      values.push(sort_order);
    }
    
    if (updateFields.length > 0) {
      updateFields.push("updated_at = NOW()");
      values.push(id);
      
      await dbExecute(
        `UPDATE news_articles SET ${updateFields.join(", ")} WHERE id = ?`,
        values
      );
    }
    
    // Handle image update
    if (removeImage) {
      await dbExecute("DELETE FROM news_images WHERE news_id = ?", [id]);
    } else if (imageFile) {
      const validation = validateNewsImage(imageFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      
      const processed = await processNewsImage(imageFile);
      
      // Check if image exists
      const [existingImage] = await dbQuery<RowDataPacket[]>(
        "SELECT id FROM news_images WHERE news_id = ?",
        [id]
      );
      
      if (existingImage[0]?.length > 0) {
        // Update existing image
        await dbExecute(
          `UPDATE news_images 
           SET image_data = ?, mime_type = ?, blur_data = ?, width = ?, height = ?, version = version + 1
           WHERE news_id = ?`,
          [processed.imageBuffer, processed.mimeType, processed.blurData, processed.metadata.width, processed.metadata.height, id]
        );
      } else {
        // Insert new image
        await dbExecute(
          `INSERT INTO news_images (id, news_id, image_data, mime_type, blur_data, width, height, version)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [randomUUID(), id, processed.imageBuffer, processed.mimeType, processed.blurData, processed.metadata.width, processed.metadata.height]
        );
      }
      
      // Increment article version
      await dbExecute(
        `UPDATE news_articles SET version = version + 1 WHERE id = ?`,
        [id]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Article updated successfully" 
    });
    
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

// ✅ DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const auth = await verifyToken(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Images will be deleted automatically due to FOREIGN KEY CASCADE
    await dbExecute("DELETE FROM news_articles WHERE id = ?", [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: "Article deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}