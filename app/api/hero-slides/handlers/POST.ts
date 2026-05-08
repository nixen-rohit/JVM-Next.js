import { NextRequest, NextResponse } from "next/server";
import getPool from "@/lib/db";
import { rowToSlide, SlideRow, base64ToBuffer } from "../helpers";
import { SlideSchema, isValidUUID } from "../validators";
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
    if (!parsed) throw new Error("Invalid image data");

    const buffer = parsed.buffer;

    const metadata = await sharp(buffer).metadata();
    console.log("📸 Image metadata:", {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
    });

    if (!metadata.format) {
      throw new Error("Unsupported image format");
    }

    const desktopBuffer = await sharp(buffer)
      .resize(1920, 800, { fit: "cover", position: "center" })
      .webp({ quality: 78, effort: 4 })
      .toBuffer();

    const mobileBuffer = await sharp(buffer)
      .resize(768, 900, { fit: "cover", position: "center" })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();

    console.log("✅ Images processed:", {
      desktop: desktopBuffer.length,
      mobile: mobileBuffer.length,
    });

    return {
      desktopBuffer,
      mobileBuffer,
      mimeType: "image/webp",
    };
  } catch (error) {
    console.error("❌ Sharp processing error:", error);
    throw new Error(
      `Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function handlePOST(request: NextRequest) {
  let connection;

  try {
    const pool = getPool();
    const config = await request.json();

    console.log("📥 Creating slide:", {
      id: config.id,
      hasImage: !!config.imageData,
      useImage: config.useImage,
    });

    const validation = SlideSchema.safeParse(config);
    if (!validation.success) {
      console.error("Validation errors:", validation.error.issues);
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert into slides table
    await connection.query(
      `INSERT INTO slides (
        id, use_image, image_alt,
        show_heading, heading, show_tag, tag,
        show_buttons, button_count,
        button1_text, button1_link, button1_variant,
        button2_text, button2_link, button2_variant,
        is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.id,
        validatedData.useImage ? 1 : 0,
        validatedData.imageAlt || "Hero slide",
        validatedData.showHeading ? 1 : 0,
        validatedData.heading || null,
        validatedData.showTag ? 1 : 0,
        validatedData.tag || null,
        validatedData.showButtons ? 1 : 0,
        validatedData.buttonCount || 1,
        validatedData.buttons[0]?.text || null,
        validatedData.buttons[0]?.link || null,
        validatedData.buttons[0]?.variant || "primary",
        validatedData.buttons[1]?.text || null,
        validatedData.buttons[1]?.link || null,
        validatedData.buttons[1]?.variant || "secondary",
        validatedData.isActive ? 1 : 0,
        validatedData.sortOrder || 0,
      ],
    );

    // ✅ Process and store images - FIXED SCOPE
    if (validatedData.useImage && validatedData.imageData) {
      const parsed = base64ToBuffer(validatedData.imageData);
      if (!parsed) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Invalid image data" },
          { status: 400 },
        );
      }

      // Validate image buffer
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
        const processed = await processHeroImage(validatedData.imageData);

        // Insert desktop image
        await connection.query(
          `INSERT INTO slide_images (id, slide_id, device_type, image_data, mime_type, version)
           VALUES (?, ?, 'desktop', ?, ?, 1)`,
          [
            randomUUID(),
            validatedData.id,
            processed.desktopBuffer,
            processed.mimeType,
          ],
        );

        // Insert mobile image
        await connection.query(
          `INSERT INTO slide_images (id, slide_id, device_type, image_data, mime_type, version)
           VALUES (?, ?, 'mobile', ?, ?, 1)`,
          [
            randomUUID(),
            validatedData.id,
            processed.mobileBuffer,
            processed.mimeType,
          ],
        );

        console.log("✅ Images saved to slide_images table");
      } catch (imgError) {
        console.error("Image processing failed:", imgError);
        await connection.rollback();
        return NextResponse.json(
          { error: "Failed to process image" },
          { status: 400 },
        );
      }
    }

    await connection.commit();
    console.log("✅ Slide created:", validatedData.id);

    const [rows] = await pool.query<SlideRow[]>(
      "SELECT * FROM slides WHERE id = ?",
      [validatedData.id],
    );

    return NextResponse.json(rowToSlide(rows[0]), { status: 201 });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create slide" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
