 // app/api/projects/[id]/handlers/GET.ts
import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { verifyToken } from "@/lib/auth";
import { UUID_REGEX } from "../../validators";
import { buildConfig, ConfigRow } from "../../helpers";

export async function handleGET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("auth_session")?.value;
    const auth = token ? await verifyToken(token) : null;

    const whereClause = auth
      ? "WHERE id = ?"
      : "WHERE id = ? AND is_published = true AND status != 'sold'";

    const [projectRows] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM projects ${whereClause}`,
      [id]
    );

    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectRows[0];

    const [configRows] = await dbQuery<ConfigRow[]>(
      "SELECT * FROM project_configs WHERE project_id = ?",
      [id]
    );
    const configRaw = configRows[0] || null;

    const config = buildConfig(configRaw);

    // Get files
    const [fileRows] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM project_files 
       WHERE project_id = ? AND is_active = true 
       ORDER BY section_name, sort_order`,
      [id]
    );

    const files: Record<string, any[]> = {};
    for (const file of fileRows) {
      const section = file.section_name;
      if (!files[section]) files[section] = [];

      files[section].push({
        id: file.id,
        src: `data:${file.mime_type};base64,${Buffer.from(file.file_data).toString("base64")}`,
        thumbnailSrc: file.thumbnail_data
          ? `data:${file.mime_type};base64,${Buffer.from(file.thumbnail_data).toString("base64")}`
          : undefined,
        alt_text: file.alt_text,
        file_name: file.file_name,
        mime_type: file.mime_type,
        sort_order: file.sort_order,
      });
    }

    // Get downloads
    const [downloadRows] = await dbQuery<RowDataPacket[]>(
      `SELECT pd.*, pf.file_name, pf.mime_type, pf.file_data 
       FROM project_downloads pd
       JOIN project_files pf ON pd.file_id = pf.id
       WHERE pd.project_id = ? AND pd.is_active = true`,
      [id]
    );

    const downloads = downloadRows.map((row: any) => ({
      id: row.id,
      type: row.download_type,
      title: row.title,
      file: {
        src: `data:${row.mime_type};base64,${Buffer.from(row.file_data).toString("base64")}`,
        name: row.file_name,
        mime: row.mime_type,
      },
    }));

    return NextResponse.json({ project, config, files, downloads });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}