// app/api/hero-slides/route.ts
import { NextRequest, NextResponse } from "next/server";
import getPool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { ButtonConfig } from "@/types/slides";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SlideConfig {
  id: string;
  useImage: boolean;
  imageUrl: string | null; // Can be URL or Base64 string
  imageAlt: string;
  showHeading: boolean;
  heading: string | null;
  showTag: boolean;
  tag: string | null;
  showButtons: boolean;
  buttonCount: 0 | 1 | 2;
  buttons: ButtonConfig[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface SlideRow extends RowDataPacket {
  id: string;
  use_image: number;
  image_url: string | null; // External URL or legacy path
  image_blob: Buffer | null; // NEW: Binary image data
  image_mime_type: string | null; // NEW: e.g., "image/jpeg"
  image_alt: string;
  show_heading: number;
  heading: string | null;
  show_tag: number;
  tag: string | null;
  show_buttons: number;
  button_count: number;
  button1_text: string | null;
  button1_link: string | null;
  button1_variant: "primary" | "secondary";
  button2_text: string | null;
  button2_link: string | null;
  button2_variant: "primary" | "secondary";
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const bufferToBase64 = (buffer: Buffer, mimeType: string): string => {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const parseBase64ToBuffer = (
  dataUrl: string,
): { buffer: Buffer; mimeType: string } | null => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], "base64"),
  };
};

// ─────────────────────────────────────────────────────────────
// Transform: DB Row → API Response
// ─────────────────────────────────────────────────────────────
const rowToConfig = (row: SlideRow): SlideConfig => {
  const buttons: ButtonConfig[] = [];
  if (row.button_count >= 1 && row.button1_text) {
    buttons.push({
      text: row.button1_text,
      link: row.button1_link || "#",
      variant: row.button1_variant,
    });
  }
  if (row.button_count === 2 && row.button2_text) {
    buttons.push({
      text: row.button2_text,
      link: row.button2_link || "#",
      variant: row.button2_variant,
    });
  }

  // ✅ Determine image source: prioritize BLOB (Base64) over URL
  let imageUrl: string | null = row.image_url;
  if (row.image_blob && row.image_mime_type) {
    imageUrl = bufferToBase64(row.image_blob, row.image_mime_type);
  }

  return {
    id: row.id,
    useImage: row.use_image === 1,
    imageUrl, // Now returns Base64 if BLOB exists
    imageAlt: row.image_alt,
    showHeading: row.show_heading === 1,
    heading: row.heading,
    showTag: row.show_tag === 1,
    tag: row.tag,
    showButtons: row.show_buttons === 1,
    buttonCount: row.button_count as 0 | 1 | 2,
    buttons,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// ─────────────────────────────────────────────────────────────
// GET: Fetch slides
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // ✅ Select BLOB columns
      const [rows] = await pool.query<SlideRow[]>(
        "SELECT * FROM slides WHERE id = ? LIMIT 1",
        [id],
      );
      if (!rows.length) {
        return NextResponse.json({ error: "Slide not found" }, { status: 404 });
      }
      return NextResponse.json(rowToConfig(rows[0]));
    }

    // ✅ Select BLOB columns for list
    const [rows] = await pool.query<SlideRow[]>(
      "SELECT * FROM slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC",
    );

    return NextResponse.json({
      slides: rows.map(rowToConfig),
      count: rows.length,
    });
  } catch (error: any) {
    console.error("GET /api/hero-slides error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch slides",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Create slide
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const config: Partial<SlideConfig> = await request.json();

    if (!config.id) {
      return NextResponse.json(
        { error: "Slide ID is required" },
        { status: 400 },
      );
    }

    // ✅ Parse Base64 image → Buffer for BLOB storage
    let imageBlob: Buffer | null = null;
    let imageMimeType: string | null = null;
    let imageUrl: string | null = config.imageUrl ?? null;

    // 🔍 Detect and parse Base64 data URI
    if (config.useImage && config.imageUrl?.startsWith("data:image")) {
      const parsed = parseBase64ToBuffer(config.imageUrl);
      if (parsed) {
        imageBlob = parsed.buffer;
        imageMimeType = parsed.mimeType;
        imageUrl = null; // Clear URL since we're using BLOB

        // 🛡️ Size guard: prevent huge payloads (15MB limit)
        if (imageBlob.length > 15 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image too large. Max 15MB after compression." },
            { status: 400 },
          );
        }
      } else {
        // ⚠️ Log warning for debugging
        console.warn(
          "⚠️ Failed to parse Base64 image:",
          config.imageUrl?.slice(0, 80) + "...",
        );
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO slides (
        id, use_image, image_url, image_blob, image_mime_type, image_alt,
        show_heading, heading, show_tag, tag,
        show_buttons, button_count,
        button1_text, button1_link, button1_variant,
        button2_text, button2_link, button2_variant,
        is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        config.id,
        config.useImage ? 1 : 0,
        imageUrl,
        imageBlob,
        imageMimeType,
        config.imageAlt ?? "Hero slide",
        config.showHeading ? 1 : 0,
        config.heading ?? null,
        config.showTag ? 1 : 0,
        config.tag ?? null,
        config.showButtons ? 1 : 0,
        config.buttonCount ?? 2,
        config.buttons?.[0]?.text ?? null,
        config.buttons?.[0]?.link ?? null,
        config.buttons?.[0]?.variant ?? "primary",
        config.buttons?.[1]?.text ?? null,
        config.buttons?.[1]?.link ?? null,
        config.buttons?.[1]?.variant ?? "secondary",
        config.isActive !== false ? 1 : 0,
        config.sortOrder ?? 0,
      ],
    );

    const [rows] = await pool.query<SlideRow[]>(
      "SELECT * FROM slides WHERE id = ? LIMIT 1",
      [config.id],
    );

    return NextResponse.json(rowToConfig(rows[0]), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/hero-slides error:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
    });

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A slide with this ID already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create slide",
        details:
          process.env.NODE_ENV === "development"
            ? `${error.message}${error.code ? ` (Code: ${error.code})` : ""}`
            : undefined,
      },
      { status: 500 },
    );
  }
}
// ─────────────────────────────────────────────────────────────
// PUT: Update slide
// ─────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Slide ID required in URL" },
        { status: 400 },
      );
    }

    const config: Partial<SlideConfig> = await request.json();

    // Validation (unchanged)
    if (
      config.buttonCount !== undefined &&
      ![0, 1, 2].includes(config.buttonCount)
    ) {
      return NextResponse.json(
        { error: "Invalid buttonCount" },
        { status: 400 },
      );
    }
    if (
      config.buttons &&
      config.buttonCount !== undefined &&
      config.buttons.length !== config.buttonCount
    ) {
      return NextResponse.json(
        { error: "buttons length must match buttonCount" },
        { status: 400 },
      );
    }
    const validVariants = ["primary", "secondary"];
    if (config.buttons?.some((btn) => !validVariants.includes(btn.variant))) {
      return NextResponse.json(
        { error: "Invalid button variant" },
        { status: 400 },
      );
    }

    // ✅ Parse Base64 image for BLOB update
    let shouldUpdateImage = false;
    let imageBlob: Buffer | null = null;
    let imageMimeType: string | null = null;
    let imageUrl: string | null = null;

    if (config.useImage !== undefined && !config.useImage) {
      // User disabled image → clear both URL and BLOB
      imageBlob = null;
      imageMimeType = null;
      imageUrl = null;
      shouldUpdateImage = true;
    } else if (config.imageUrl?.includes(";base64,")) {
      // New Base64 upload → parse to BLOB
      const parsed = parseBase64ToBuffer(config.imageUrl);
      if (parsed) {
        // 🛡️ Size guard: prevent huge payloads (15MB limit)
        if (parsed.buffer.length > 15 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image too large. Max 15MB after compression." },
            { status: 400 },
          );
        }
        imageBlob = parsed.buffer;
        imageMimeType = parsed.mimeType;
        imageUrl = null;
        shouldUpdateImage = true;
      } else {
        console.warn(
          "⚠️ Failed to parse Base64 image:",
          config.imageUrl?.slice(0, 80) + "...",
        );
      }
    } else if (config.imageUrl !== undefined) {
      // External URL provided → clear BLOB, set URL
      imageBlob = null;
      imageMimeType = null;
      imageUrl = config.imageUrl;
      shouldUpdateImage = true;
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<
      string,
      { col: string; transform?: (v: any) => any }
    > = {
      useImage: { col: "use_image", transform: (v: boolean) => (v ? 1 : 0) },
      imageAlt: { col: "image_alt" },
      showHeading: {
        col: "show_heading",
        transform: (v: boolean) => (v ? 1 : 0),
      },
      heading: { col: "heading" },
      showTag: { col: "show_tag", transform: (v: boolean) => (v ? 1 : 0) },
      tag: { col: "tag" },
      showButtons: {
        col: "show_buttons",
        transform: (v: boolean) => (v ? 1 : 0),
      },
      buttonCount: { col: "button_count" },
      isActive: { col: "is_active", transform: (v: boolean) => (v ? 1 : 0) },
      sortOrder: { col: "sort_order" },
    };

    // Standard fields
    Object.entries(fieldMap).forEach(([key, { col, transform }]) => {
      if (config[key as keyof SlideConfig] !== undefined) {
        updates.push(`${col} = ?`);
        values.push(
          transform
            ? transform(config[key as keyof SlideConfig])
            : config[key as keyof SlideConfig],
        );
      }
    });

    // ✅ Image fields: only update if explicitly changed
    if (shouldUpdateImage) {
      updates.push("image_url = ?, image_blob = ?, image_mime_type = ?");
      values.push(imageUrl, imageBlob, imageMimeType);
    }

    // Buttons handling (unchanged)
    if (config.buttons) {
      if (config.buttons[0]) {
        updates.push("button1_text = ?, button1_link = ?, button1_variant = ?");
        values.push(
          config.buttons[0].text,
          config.buttons[0].link,
          config.buttons[0].variant,
        );
      } else {
        updates.push(
          "button1_text = NULL, button1_link = NULL, button1_variant = 'primary'",
        );
      }
      if (config.buttonCount === 2 && config.buttons[1]) {
        updates.push("button2_text = ?, button2_link = ?, button2_variant = ?");
        values.push(
          config.buttons[1].text,
          config.buttons[1].link,
          config.buttons[1].variant,
        );
      } else {
        updates.push(
          "button2_text = NULL, button2_link = NULL, button2_variant = 'secondary'",
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE slides SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Slide not found or no changes" },
        { status: 404 },
      );
    }

    const [rows] = await pool.query<SlideRow[]>(
      "SELECT * FROM slides WHERE id = ? LIMIT 1",
      [id],
    );

    return NextResponse.json(rowToConfig(rows[0]));
  } catch (error: any) {
    console.error("PUT /api/hero-slides error:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
    });

    return NextResponse.json(
      {
        error: "Failed to update slide",
        details:
          process.env.NODE_ENV === "development"
            ? `${error.message}${error.code ? ` (Code: ${error.code})` : ""}`
            : undefined,
      },
      { status: 500 },
    );
  }
}
// ─────────────────────────────────────────────────────────────
// DELETE: Soft or hard delete (BLOB-optimized)
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const hardDelete = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Slide ID is required" },
        { status: 400 },
      );
    }

    // ✅ No filesystem cleanup needed - BLOBs are in DB!
    // Just handle database deletion

    if (hardDelete) {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM slides WHERE id = ?",
        [id],
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Slide not found" }, { status: 404 });
      }
      return NextResponse.json({
        message: "Slide permanently deleted (BLOB removed)",
      });
    } else {
      // Soft delete: just deactivate
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE slides SET is_active = 0, updated_at = NOW() WHERE id = ?",
        [id],
      );
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Slide not found or already inactive" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        message: "Slide deactivated (BLOB preserved)",
      });
    }
  } catch (error: any) {
    console.error("DELETE /api/hero-slides error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete slide",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
