// app/api/admin/projects/route.ts
 
import { generateHashId } from "@/types/id";
import { NextRequest, NextResponse } from "next/server";
import { getPool, dbQuery, dbExecute } from "@/lib/db";
import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2";
import { verifyToken } from "@/lib/auth";

// ── GET /api/admin/projects?page=1&limit=10 ──────────────────────────────────
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

    // FIX #3: Parse and validate pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
    );
    const offset = (page - 1) * limit;

    // FIX #3: Fetch total count separately so the client can render pagination
    const [countRows] = await dbQuery<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM projects",
    );
    const total: number = countRows[0]?.total ?? 0;

    // FIX #3: Apply LIMIT + OFFSET
    const [rows] = await dbQuery<RowDataPacket[]>(
     `SELECT id, name, slug, status, is_published, created_at, updated_at, sort_order
       FROM projects
       ORDER BY sort_order ASC, created_at ASC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return NextResponse.json({ success: true, projects: rows, total });
  } catch (error) {
    console.error("GET /api/admin/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// ── POST /api/admin/projects ─────────────────────────────────────────────────
 

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

    const body = await request.json();
    const { name, slug, status = "upcoming", is_published = false } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name is required (slug is auto-generated)" },
        { status: 400 },
      );
    }

    // Handle slug conflicts: auto-append short unique suffix
    let finalslug = slug;
    let attempts = 0;

    while (attempts < 5) {
      const [existing] = await dbQuery<RowDataPacket[]>(
        "SELECT id FROM projects WHERE slug = ? LIMIT 1",
        [finalslug],
      );
      if (existing.length === 0) break;
      finalslug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      attempts++;
    }

    if (attempts >= 5) {
      return NextResponse.json(
        {
          error: "Could not generate unique slug. Please try a different name.",
        },
        { status: 400 },
      );
    }

    // ✅ Generate hash ID instead of relying on AUTO_INCREMENT
    const projectId = generateHashId(); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    const configId = generateHashId(); // Separate ID for config row

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ✅ Insert project WITH explicit hash ID
      await dbExecute(
        `INSERT INTO projects (id, name, slug, status, is_published)
         VALUES (?, ?, ?, ?, ?)`,
        [projectId, name, finalslug, status, is_published],
        connection, // ← Pass connection for transaction
      );

      // ✅ Insert config WITH explicit hash ID + project_id FK
      await dbExecute(
        `INSERT INTO project_configs (id, project_id) VALUES (?, ?)`,
        [configId, projectId],
        connection,
      );

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: "Project created",
          projectId, // ← Return hash ID (string)
          slug: finalslug,
        },
        { status: 201 },
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("POST /api/admin/projects error:", error);
    if ((error as any).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
