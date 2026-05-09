 // app/api/projects/[id]/handlers/DELETE.ts 
 
import { NextRequest, NextResponse } from "next/server";
import { getPool, dbExecute } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { UUID_REGEX } from "../../validators";

export async function handleDELETE(
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

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await dbExecute(
        `DELETE FROM project_downloads WHERE project_id = ?`,
        [id],
        connection
      );
      await dbExecute(
        `DELETE FROM project_files WHERE project_id = ?`,
        [id],
        connection
      );
      await dbExecute(
        `DELETE FROM project_configs WHERE project_id = ?`,
        [id],
        connection
      );

      const [result] = await dbExecute(
        `DELETE FROM projects WHERE id = ?`,
        [id],
        connection
      );

      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Project permanently deleted",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}