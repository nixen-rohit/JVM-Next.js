import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import getPool from "@/lib/db";
import { CreateContactInput } from "@/types/contact";

// ✅ Required for Vercel + mysql2
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// GET: Paginated contacts list (admin only)
export async function GET(request: NextRequest) {
  try {
    const pool = getPool();

    if (!pool) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 5);

    const offset = (page - 1) * limit;

    // Get paginated contacts
    const [rows] = await pool.query(
      `
      SELECT id, name, email, phone, message, createdAt
      FROM contacts
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    // Get total count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM contacts`
    );

    const total = countRows?.[0]?.total || 0;

    return NextResponse.json({
      contacts: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET contacts error:", error);

    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST: Create new contact submission (public)
export async function POST(request: NextRequest) {
  try {
    const pool = getPool();

    if (!pool) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const body: CreateContactInput = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const id = randomUUID();

    await pool.execute(
      "INSERT INTO contacts (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)",
      [id, body.name, body.email, body.phone || null, body.message]
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("POST contact error:", error);

    return NextResponse.json(
      { error: "Failed to save contact" },
      { status: 500 }
    );
  }
}