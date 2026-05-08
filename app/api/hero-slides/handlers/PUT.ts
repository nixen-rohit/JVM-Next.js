import { NextRequest, NextResponse } from "next/server";
import getPool from "@/lib/db";
import { rowToSlide, SlideRow, base64ToBuffer } from "../helpers";
import { isValidUUID } from "../validators";
import { randomUUID } from "crypto";
import sharp from "sharp";

// Validate image buffer
function validateImageBuffer(
  buffer: Buffer,
  mimeType: string,
): { valid: boolean; error?: string } {
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `Image too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Maximum size is 2MB.`,
    };
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, or WebP.`,
    };
  }

  return { valid: true };
}

async function processHeroImage(base64Data: string) {
  try {
    const parsed = base64ToBuffer(base64Data);
    if (!parsed) throw new Error("Invalid image data - failed to parse base64");

    const buffer = parsed.buffer;
    console.log("📸 Buffer size:", buffer.length);

    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
      console.log("📸 Image metadata:", {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
      });
    } catch (metadataError) {
      console.error("❌ Failed to read metadata:", metadataError);
      throw new Error(
        `Cannot read image metadata: ${metadataError instanceof Error ? metadataError.message : "Unknown"}`,
      );
    }

    if (!metadata.format) {
      throw new Error("Unsupported image format - no format detected");
    }

    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image dimensions");
    }

    let desktopBuffer;
    try {
      desktopBuffer = await sharp(buffer)
        .resize(1920, 800, { fit: "cover", position: "center" })
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
      console.log("✅ Desktop processed:", desktopBuffer.length);
    } catch (desktopError) {
      console.error("❌ Desktop processing failed:", desktopError);
      throw new Error(
        `Desktop resize failed: ${desktopError instanceof Error ? desktopError.message : "Unknown"}`,
      );
    }

    let mobileBuffer;
    try {
      mobileBuffer = await sharp(buffer)
        .resize(768, 900, { fit: "cover", position: "center" })
        .webp({ quality: 72, effort: 4 })
        .toBuffer();
      console.log("✅ Mobile processed:", mobileBuffer.length);
    } catch (mobileError) {
      console.error("❌ Mobile processing failed:", mobileError);
      throw new Error(
        `Mobile resize failed: ${mobileError instanceof Error ? mobileError.message : "Unknown"}`,
      );
    }

    return {
      desktopBuffer,
      mobileBuffer,
      mimeType: "image/webp",
    };
  } catch (error) {
    console.error("❌ processHeroImage error:", error);
    throw error;
  }
}

export async function handlePUT(request: NextRequest) {
  let connection;
  let nextVersion = 1;

  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Slide ID required" }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
    }

    const updates = await request.json();
    console.log("📥 Updating slide:", { id, hasImage: !!updates.imageData });

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query<SlideRow[]>(
      "SELECT * FROM slides WHERE id = ? FOR UPDATE",
      [id],
    );

    if (!existing.length) {
      await connection.rollback();
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    // Build update query for slides table
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.useImage !== undefined) {
      updateFields.push("use_image = ?");
      values.push(updates.useImage ? 1 : 0);
    }

    if (updates.imageAlt !== undefined) {
      updateFields.push("image_alt = ?");
      values.push(updates.imageAlt);
    }

    if (updates.showHeading !== undefined) {
      updateFields.push("show_heading = ?");
      values.push(updates.showHeading ? 1 : 0);
    }

    if (updates.heading !== undefined) {
      updateFields.push("heading = ?");
      values.push(updates.heading);
    }

    if (updates.showTag !== undefined) {
      updateFields.push("show_tag = ?");
      values.push(updates.showTag ? 1 : 0);
    }

    if (updates.tag !== undefined) {
      updateFields.push("tag = ?");
      values.push(updates.tag);
    }

    if (updates.showButtons !== undefined) {
      updateFields.push("show_buttons = ?");
      values.push(updates.showButtons ? 1 : 0);
    }

    if (updates.buttonCount !== undefined) {
      updateFields.push("button_count = ?");
      values.push(updates.buttonCount);
    }

    if (updates.buttons) {
      if (updates.buttons[0]) {
        updateFields.push(
          "button1_text = ?, button1_link = ?, button1_variant = ?",
        );
        values.push(
          updates.buttons[0].text,
          updates.buttons[0].link,
          updates.buttons[0].variant,
        );
      }
      if (updates.buttonCount === 2 && updates.buttons[1]) {
        updateFields.push(
          "button2_text = ?, button2_link = ?, button2_variant = ?",
        );
        values.push(
          updates.buttons[1].text,
          updates.buttons[1].link,
          updates.buttons[1].variant,
        );
      }
    }

    if (updates.isActive !== undefined) {
      updateFields.push("is_active = ?");
      values.push(updates.isActive ? 1 : 0);
    }

    if (updates.sortOrder !== undefined) {
      updateFields.push("sort_order = ?");
      values.push(updates.sortOrder);
    }

    if (updateFields.length > 0) {
      updateFields.push("updated_at = NOW()");
      values.push(id);

      await connection.query(
        `UPDATE slides SET ${updateFields.join(", ")} WHERE id = ?`,
        values,
      );
      console.log("✅ Slides table updated");
    }

    // ✅ Handle image update with validation
    if (updates.useImage && updates.imageData) {
      const parsed = base64ToBuffer(updates.imageData);
      if (!parsed) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Invalid image data" },
          { status: 400 },
        );
      }

      // ✅ Validate image buffer
      const imageValidation = validateImageBuffer(
        parsed.buffer,
        parsed.mimeType,
      );
      if (!imageValidation.valid) {
        await connection.rollback();
        return NextResponse.json(
          { error: imageValidation.error },
          { status: 400 },
        );
      }

      try {
        // ✅ Process image with Sharp
        const processed = await processHeroImage(updates.imageData);

        // Delete old images
        await connection.query(
          `DELETE FROM slide_images 
           WHERE slide_id = ? AND device_type IN ('desktop', 'mobile')`,
          [id],
        );

        // Get next version
        const [versionResult] = await connection.query<any[]>(
          `SELECT COALESCE(MAX(version), 0) + 1 as next_version 
           FROM slide_images 
           WHERE slide_id = ?`,
          [id],
        );
        nextVersion = versionResult[0]?.next_version || 1;

        // Insert new desktop image with processed WebP
        await connection.query(
          `INSERT INTO slide_images (id, slide_id, device_type, image_data, mime_type, version)
           VALUES (?, ?, 'desktop', ?, ?, ?)`,
          [
            randomUUID(),
            id,
            processed.desktopBuffer,
            processed.mimeType,
            nextVersion,
          ],
        );

        // Insert new mobile image with processed WebP
        await connection.query(
          `INSERT INTO slide_images (id, slide_id, device_type, image_data, mime_type, version)
           VALUES (?, ?, 'mobile', ?, ?, ?)`,
          [
            randomUUID(),
            id,
            processed.mobileBuffer,
            processed.mimeType,
            nextVersion,
          ],
        );

        // Update slide version
        await connection.query(`UPDATE slides SET version = ? WHERE id = ?`, [
          nextVersion,
          id,
        ]);

        console.log(`✅ Images updated to version ${nextVersion}`);
      } catch (imgError) {
        console.error("Image processing failed:", imgError);
        await connection.rollback();
        return NextResponse.json(
          {
            error: `Failed to process image: ${imgError instanceof Error ? imgError.message : "Unknown"}`,
          },
          { status: 400 },
        );
      }
    }

    await connection.commit();
    console.log("✅ Slide updated successfully:", id);

    const [rows] = await pool.query<SlideRow[]>(
      "SELECT * FROM slides WHERE id = ? LIMIT 1",
      [id],
    );

    const slide = rowToSlide(rows[0]);
    return NextResponse.json({
      ...slide,
      version: nextVersion,
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("❌ PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update slide" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
