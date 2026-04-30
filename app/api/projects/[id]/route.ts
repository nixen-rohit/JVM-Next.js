// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPool, dbQuery, dbExecute } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// ── Validation schema aligned exactly with DB schema ─────────────────────────
// app/api/projects/[id]/route.ts - Update the validation schema

const updateProjectSchema = z.object({
  name: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  status: z.enum(["ongoing", "sold", "upcoming"]).optional(),
  is_published: z
    .boolean()
    .or(z.number().transform((val) => Boolean(val)))
    .optional(), // ✅ Accept 0/1 and convert

  config: z
    .object({
      sections: z.record(z.string(), z.boolean()).optional(),

      hero: z
        .object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
        })
        .optional(),

      info: z
        .object({
          title: z.string().optional(),
          firstDescription: z.string().optional(),
          secondDescription: z.string().optional(),
        })
        .optional(),

      stats: z
        .array(
          z.object({
            icon: z.string().optional(),
            title: z.string().optional(),
            desc: z.string().optional(),
          }),
        )
        .optional(),

      highlight: z
        .object({
          title: z.string().optional(),
          paragraph: z.string().optional(),
        })
        .optional(),

      location: z
        .object({
          googleMapEmbedUrl: z.string().optional(),
        })
        .optional(),

      collage: z
        .object({
          showMoreLimit: z.number().int().positive().optional(),
          layoutPattern: z.enum(["modulo-6", "masonry", "grid"]).optional(),
        })
        .optional(),
    })
    .optional(),
});

type UpdatePayload = z.infer<typeof updateProjectSchema>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 },
      );
    }

    const token = request.cookies.get("auth_session")?.value;
    const auth = token ? await verifyToken(token) : null;

    const whereClause = auth
      ? "WHERE id = ?"
      : "WHERE id = ? AND is_published = true AND status != 'sold'";

    const [projectRows] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM projects ${whereClause}`,
      [id],
    );

    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectRows[0];

    const [configRows] = await dbQuery<RowDataPacket[]>(
      "SELECT * FROM project_configs WHERE project_id = ?",
      [id],
    );
    const configRaw = configRows[0];

    const config = {
      sections: {
        hero: !!configRaw?.section_hero_enabled,
        info: !!configRaw?.section_info_enabled,
        stats: !!configRaw?.section_stats_enabled,
        highlight: !!configRaw?.section_highlight_enabled,
        media: !!configRaw?.section_media_enabled,
        units: !!configRaw?.section_units_enabled,
        collage: !!configRaw?.section_collage_enabled,
        location: !!configRaw?.section_location_enabled,
      },
      hero: configRaw?.hero_title
        ? {
            title: configRaw.hero_title,
            subtitle: configRaw.hero_subtitle ?? "",
          }
        : undefined,
      info: configRaw?.info_title
        ? {
            title: configRaw.info_title,
            firstDescription: configRaw.info_firstdescription ?? "",
            secondDescription: configRaw.info_seconddescription ?? "",
          }
        : undefined,
      stats: configRaw?.stats_config
        ? (() => {
            try {
              return JSON.parse(configRaw.stats_config);
            } catch {
              return [];
            }
          })()
        : [],
      highlight: configRaw?.highlight_title
        ? {
            title: configRaw.highlight_title,
            paragraph: configRaw.highlight_paragraph ?? "",
          }
        : undefined,
      location: configRaw?.google_map_embed_url
        ? { googleMapEmbedUrl: configRaw.google_map_embed_url }
        : undefined,
      collage: {
        showMoreLimit: configRaw?.collage_show_more_limit ?? 6,
        layoutPattern:
          (configRaw?.collage_layout_pattern as
            | "modulo-6"
            | "masonry"
            | "grid") ?? "modulo-6",
      },
    };

    const [fileRows] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM project_files 
       WHERE project_id = ? AND is_active = true 
       ORDER BY section_name, sort_order`,
      [id],
    );

    const files: Record<string, any[]> = {};
    for (const file of fileRows) {
      const section = file.section_name;
      if (!files[section]) files[section] = [];

      const src = `data:${file.mime_type};base64,${Buffer.from(file.file_data).toString("base64")}`;
      const thumbnailSrc = file.thumbnail_data
        ? `data:${file.mime_type};base64,${Buffer.from(file.thumbnail_data).toString("base64")}`
        : undefined;

      files[section].push({
        id: file.id,
        src,
        thumbnailSrc,
        alt_text: file.alt_text,
        file_name: file.file_name,
        mime_type: file.mime_type,
        sort_order: file.sort_order,
      });
    }

    const [downloadRows] = await dbQuery<RowDataPacket[]>(
      `SELECT pd.*, pf.file_name, pf.mime_type, pf.file_data 
       FROM project_downloads pd
       JOIN project_files pf ON pd.file_id = pf.id
       WHERE pd.project_id = ? AND pd.is_active = true`,
      [id],
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
      { status: 500 },
    );
  }
}

 
// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 400 },
      );
    }

    const formData = await request.formData();

    let projectUpdate: any = {};
    let configUpdate: any = {};

    try {
      const raw = formData.get("project");
      if (raw) {
        projectUpdate = JSON.parse(raw as string);
        console.log("📦 Project update:", JSON.stringify(projectUpdate, null, 2));
      }
    } catch (err) {
      console.error("❌ Failed to parse project JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON in project field", details: String(err) },
        { status: 400 },
      );
    }

    try {
      const raw = formData.get("config");
      if (raw) {
        configUpdate = JSON.parse(raw as string);
        console.log("📦 Config update:", JSON.stringify(configUpdate, null, 2));
      }
    } catch (err) {
      console.error("❌ Failed to parse config JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON in config field", details: String(err) },
        { status: 400 },
      );
    }

    // ── Validate with transformation ──────────────────────────────────────────────
    const payload = { ...projectUpdate, config: configUpdate };

    console.log("🔍 Validating payload:", JSON.stringify(payload, null, 2));

    const validated = updateProjectSchema.safeParse(payload);

    if (!validated.success) {
      const details = validated.error.flatten();
      console.error("❌ Validation failed");
      console.error("  Field errors:", JSON.stringify(details.fieldErrors, null, 2));
      console.error("  Form errors:", details.formErrors);
      console.error("  Raw payload:", JSON.stringify(payload, null, 2));

      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: details.fieldErrors,
          formErrors: details.formErrors,
          receivedPayload: {
            project: projectUpdate,
            config: configUpdate,
          },
        },
        { status: 400 },
      );
    }

    console.log("✅ Validation passed");

    const { config, ...projectFields } = validated.data as UpdatePayload & {
      config?: any;
    };

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Update projects table
      const projectUpdateFields: string[] = [];
      const projectUpdateValues: any[] = [];

      if (projectFields.name !== undefined) {
        projectUpdateFields.push("name = ?");
        projectUpdateValues.push(projectFields.name);
      }
      if (projectFields.slug !== undefined) {
        projectUpdateFields.push("slug = ?");
        projectUpdateValues.push(projectFields.slug);
      }
      if (projectFields.status !== undefined) {
        projectUpdateFields.push("status = ?");
        projectUpdateValues.push(projectFields.status);
      }
      if (projectFields.is_published !== undefined) {
        projectUpdateFields.push("is_published = ?");
        projectUpdateValues.push(projectFields.is_published ? 1 : 0);
      }

      if (projectUpdateFields.length > 0) {
        projectUpdateValues.push(id);
        await dbExecute(
          `UPDATE projects SET ${projectUpdateFields.join(", ")} WHERE id = ?`,
          projectUpdateValues,
          connection,
        );
        console.log("✅ Projects table updated");
      }

      // 2. Handle ALL file uploads and deletions
      const uploadedFiles = formData.getAll("files") as File[];
      const fileMetadata = formData.get("fileMetadata")
        ? JSON.parse(formData.get("fileMetadata") as string)
        : [];

      // ✅ Get keepFileIds from frontend
      const keepFileIdsRaw = formData.get("keepFileIds");
      const keepFileIds: string[] = keepFileIdsRaw ? JSON.parse(keepFileIdsRaw as string) : [];
      
      console.log(`🗑️ Files to keep (${keepFileIds.length}):`, keepFileIds);

      // Track which sections have new uploads
      const sectionsWithNewUploads = new Set<string>();
      for (const meta of fileMetadata) {
        sectionsWithNewUploads.add(meta.section_name);
      }

      // Delete existing files for single-file sections that are getting new uploads
      for (const section of sectionsWithNewUploads) {
        if (["hero", "highlight", "location"].includes(section)) {
          console.log(`🗑️ Deleting existing ${section} file before new upload`);
          await dbExecute(
            `DELETE FROM project_files WHERE project_id = ? AND section_name = ?`,
            [id, section],
            connection,
          );
        }
      }

      // Insert new files
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const meta = fileMetadata[i];
        if (!file || !meta) continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        const thumbnailBuffer = meta.file_type === "image" && file.size > 500000 ? buffer : null;

        await dbExecute(
          `INSERT INTO project_files (
            id, project_id, section_name, file_type, mime_type, file_name,
            file_data, thumbnail_data, alt_text, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            id,
            meta.section_name,
            meta.file_type,
            meta.mime_type,
            meta.file_name,
            buffer,
            thumbnailBuffer,
            meta.alt_text || null,
            meta.sort_order ?? 0,
          ],
          connection,
        );
        console.log(`✅ Uploaded ${meta.section_name} file: ${meta.file_name}`);
      }

      // ✅ CRITICAL: Delete files that are NOT in keepFileIds
      // This handles deletions for media, units, collage, and any other multi-file sections
      if (keepFileIds.length > 0) {
        // Build query to delete files not in keep list
        const placeholders = keepFileIds.map(() => '?').join(',');
        const deleteQuery = `
          DELETE FROM project_files 
          WHERE project_id = ? 
          AND section_name NOT IN ('hero', 'highlight', 'location')
          AND id NOT IN (${placeholders})
        `;
        const [deleteResult] = await dbExecute(deleteQuery, [id, ...keepFileIds], connection);
        console.log(`🗑️ Deleted ${(deleteResult as any).affectedRows} files not in keep list`);
      } else if (keepFileIds.length === 0 && sectionsWithNewUploads.size === 0) {
        // If no files to keep AND no new uploads, delete ALL multi-section files
        const deleteQuery = `
          DELETE FROM project_files 
          WHERE project_id = ? 
          AND section_name NOT IN ('hero', 'highlight', 'location')
        `;
        const [deleteResult] = await dbExecute(deleteQuery, [id], connection);
        console.log(`🗑️ Deleted ${(deleteResult as any).affectedRows} files (no keep list)`);
      }

      // 3. Upsert project_configs (unchanged)
      if (config && Object.keys(config).length > 0) {
        const { sections, hero, info, stats, highlight, location, collage } = config;

        const [existing] = await dbQuery<RowDataPacket[]>(
          "SELECT id FROM project_configs WHERE project_id = ?",
          [id],
          connection,
        );

        if (existing.length > 0) {
          const updateFields: string[] = [];
          const updateValues: any[] = [];

          if (sections) {
            const sectionMap: Record<string, string> = {
              hero: "section_hero_enabled",
              info: "section_info_enabled",
              stats: "section_stats_enabled",
              highlight: "section_highlight_enabled",
              media: "section_media_enabled",
              units: "section_units_enabled",
              collage: "section_collage_enabled",
              location: "section_location_enabled",
            };
            for (const [key, col] of Object.entries(sectionMap)) {
              if (sections[key] !== undefined) {
                updateFields.push(`${col} = ?`);
                updateValues.push(sections[key] ? 1 : 0);
              }
            }
          }

          if (hero?.title !== undefined) {
            updateFields.push("hero_title = ?");
            updateValues.push(hero.title || null);
          }
          if (hero?.subtitle !== undefined) {
            updateFields.push("hero_subtitle = ?");
            updateValues.push(hero.subtitle || null);
          }
          if (info?.title !== undefined) {
            updateFields.push("info_title = ?");
            updateValues.push(info.title || null);
          }
          if (info?.firstDescription !== undefined) {
            updateFields.push("info_firstdescription = ?");
            updateValues.push(info.firstDescription || null);
          }
          if (info?.secondDescription !== undefined) {
            updateFields.push("info_seconddescription = ?");
            updateValues.push(info.secondDescription || null);
          }
          if (stats !== undefined) {
            updateFields.push("stats_config = ?");
            updateValues.push(stats && stats.length > 0 ? JSON.stringify(stats) : null);
          }
          if (highlight?.title !== undefined) {
            updateFields.push("highlight_title = ?");
            updateValues.push(highlight.title || null);
          }
          if (highlight?.paragraph !== undefined) {
            updateFields.push("highlight_paragraph = ?");
            updateValues.push(highlight.paragraph || null);
          }
          if (location?.googleMapEmbedUrl !== undefined) {
            updateFields.push("google_map_embed_url = ?");
            updateValues.push(location.googleMapEmbedUrl || null);
          }
          if (collage?.showMoreLimit !== undefined) {
            updateFields.push("collage_show_more_limit = ?");
            updateValues.push(collage.showMoreLimit);
          }
          if (collage?.layoutPattern !== undefined) {
            updateFields.push("collage_layout_pattern = ?");
            updateValues.push(collage.layoutPattern);
          }

          if (updateFields.length > 0) {
            updateValues.push(id);
            await dbExecute(
              `UPDATE project_configs SET ${updateFields.join(", ")} WHERE project_id = ?`,
              updateValues,
              connection,
            );
            console.log("✅ Project configs updated");
          }
        } else {
          const configId = randomUUID();
          await dbExecute(
            `INSERT INTO project_configs (
              id, project_id,
              section_hero_enabled, section_info_enabled, section_stats_enabled,
              section_highlight_enabled, section_media_enabled, section_units_enabled,
              section_collage_enabled, section_location_enabled,
              hero_title, hero_subtitle,
              info_title, info_firstdescription, info_seconddescription,
              stats_config,
              highlight_title, highlight_paragraph,
              google_map_embed_url,
              collage_show_more_limit, collage_layout_pattern
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              configId,
              id,
              sections?.hero ? 1 : 1,
              sections?.info ? 1 : 1,
              sections?.stats ? 1 : 1,
              sections?.highlight ? 1 : 1,
              sections?.media ? 1 : 1,
              sections?.units ? 1 : 1,
              sections?.collage ? 1 : 1,
              sections?.location ? 1 : 1,
              hero?.title ?? null,
              hero?.subtitle ?? null,
              info?.title ?? null,
              info?.firstDescription ?? null,
              info?.secondDescription ?? null,
              stats && stats.length > 0 ? JSON.stringify(stats) : null,
              highlight?.title ?? null,
              highlight?.paragraph ?? null,
              location?.googleMapEmbedUrl ?? null,
              collage?.showMoreLimit ?? 6,
              collage?.layoutPattern ?? "modulo-6",
            ],
            connection,
          );
          console.log("✅ New project configs inserted");
        }
      }

      // 4. Handle downloads - DELETE ALL then RE-CREATE
      console.log("🗑️ Deleting all existing downloads");
      await dbExecute(
        `DELETE pd, pf FROM project_downloads pd 
         JOIN project_files pf ON pd.file_id = pf.id 
         WHERE pd.project_id = ?`,
        [id],
        connection,
      );

      const brochureFile = formData.get("brochureFile") as File | null;
      const brochureTitle = formData.get("brochureTitle") as string | null;

      const documentFile = formData.get("documentFile") as File | null;
      const documentTitle = formData.get("documentTitle") as string | null;

      if (brochureFile && brochureTitle) {
        console.log("📄 Creating brochure...");
        const buffer = Buffer.from(await brochureFile.arrayBuffer());
        const brochureFileId = randomUUID();

        await dbExecute(
          `INSERT INTO project_files (
            id, project_id, section_name, file_type, mime_type, file_name, file_data
          ) VALUES (?, ?, 'brochure', 'pdf', ?, ?, ?)`,
          [brochureFileId, id, brochureFile.type, brochureFile.name, buffer],
          connection,
        );

        await dbExecute(
          `INSERT INTO project_downloads (id, project_id, download_type, title, file_id)
           VALUES (?, ?, 'brochure', ?, ?)`,
          [randomUUID(), id, brochureTitle, brochureFileId],
          connection,
        );
        console.log("✅ Brochure created");
      }

      if (documentFile && documentTitle) {
        console.log("📄 Creating document...");
        const buffer = Buffer.from(await documentFile.arrayBuffer());
        const documentFileId = randomUUID();

        await dbExecute(
          `INSERT INTO project_files (
            id, project_id, section_name, file_type, mime_type, file_name, file_data
          ) VALUES (?, ?, 'document', 'pdf', ?, ?, ?)`,
          [documentFileId, id, documentFile.type, documentFile.name, buffer],
          connection,
        );

        await dbExecute(
          `INSERT INTO project_downloads (id, project_id, download_type, title, file_id)
           VALUES (?, ?, 'document', ?, ?)`,
          [randomUUID(), id, documentTitle, documentFileId],
          connection,
        );
        console.log("✅ Document created");
      }

      await connection.commit();
      console.log("🎉 All changes committed successfully");

      return NextResponse.json({
        success: true,
        message: "Project updated successfully",
      });
    } catch (err) {
      await connection.rollback();
      console.error("❌ Transaction failed, rolling back:", err);
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.cookies.get("auth_session")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth = await verifyToken(token);
    if (!auth)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id } = await params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid project ID format" },
        { status: 400 },
      );
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await dbExecute(
        `DELETE FROM project_downloads WHERE project_id = ?`,
        [id],
        connection,
      );
      await dbExecute(
        `DELETE FROM project_files WHERE project_id = ?`,
        [id],
        connection,
      );
      await dbExecute(
        `DELETE FROM project_configs WHERE project_id = ?`,
        [id],
        connection,
      );

      const [result] = await dbExecute(
        `DELETE FROM projects WHERE id = ?`,
        [id],
        connection,
      );

      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }

      await connection.commit();

      try {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/projects", "layout");
        revalidatePath("/api/projects/slug");
      } catch (e) {
        console.warn("Cache revalidation skipped:", e);
      }

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
      { status: 500 },
    );
  }
}
