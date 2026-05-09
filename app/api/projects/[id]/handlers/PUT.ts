// app/api/projects/[id]/handlers/PUT.ts 
 
 
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPool, dbQuery, dbExecute } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { updateProjectSchema, UUID_REGEX, UpdatePayload } from "../../validators";
import { RowDataPacket } from "mysql2";

export async function handlePUT(
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
        { status: 400 }
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
        { status: 400 }
      );
    }

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
        { status: 400 }
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
          connection
        );
        console.log("✅ Projects table updated");
      }

      // 2. Handle ALL file uploads and deletions
      const uploadedFiles = formData.getAll("files") as File[];
      const fileMetadata = formData.get("fileMetadata")
        ? JSON.parse(formData.get("fileMetadata") as string)
        : [];

      const keepFileIdsRaw = formData.get("keepFileIds");
      const keepFileIds: string[] = keepFileIdsRaw
        ? JSON.parse(keepFileIdsRaw as string)
        : [];

      console.log(`🗑️ Files to keep (${keepFileIds.length}):`, keepFileIds);

      const sectionsWithNewUploads = new Set<string>();
      for (const meta of fileMetadata) {
        sectionsWithNewUploads.add(meta.section_name);
      }

      for (const section of sectionsWithNewUploads) {
        if (["hero", "highlight", "location"].includes(section)) {
          console.log(`🗑️ Deleting existing ${section} file before new upload`);
          await dbExecute(
            `DELETE FROM project_files WHERE project_id = ? AND section_name = ?`,
            [id, section],
            connection
          );
        }
      }

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
          connection
        );
        console.log(`✅ Uploaded ${meta.section_name} file: ${meta.file_name}`);
      }

      if (keepFileIds.length > 0) {
        const placeholders = keepFileIds.map(() => "?").join(",");
        const deleteQuery = `
          DELETE FROM project_files 
          WHERE project_id = ? 
          AND section_name NOT IN ('hero', 'highlight', 'location')
          AND id NOT IN (${placeholders})
        `;
        const [deleteResult] = await dbExecute(
          deleteQuery,
          [id, ...keepFileIds],
          connection
        );
        console.log(`🗑️ Deleted ${(deleteResult as any).affectedRows} files not in keep list`);
      } else if (keepFileIds.length === 0 && sectionsWithNewUploads.size === 0) {
        const deleteQuery = `
          DELETE FROM project_files 
          WHERE project_id = ? 
          AND section_name NOT IN ('hero', 'highlight', 'location')
        `;
        const [deleteResult] = await dbExecute(deleteQuery, [id], connection);
        console.log(`🗑️ Deleted ${(deleteResult as any).affectedRows} files (no keep list)`);
      }

      // 3. Upsert project_configs
      if (config && Object.keys(config).length > 0) {
        const { sections, hero, info, stats, highlight, location, collage, keyFeatures } = config;

        const [existing] = await dbQuery<RowDataPacket[]>(
          "SELECT id FROM project_configs WHERE project_id = ?",
          [id],
          connection
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
              keyFeatures: "section_key_features_enabled",
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
            updateValues.push(stats && stats.length > 0 ? JSON.stringify(stats) : JSON.stringify([]));
            console.log("📊 Updating stats with:", stats);
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
          if (keyFeatures !== undefined) {
            updateFields.push("key_features = ?");
            updateValues.push(JSON.stringify(keyFeatures));
          }

          if (updateFields.length > 0) {
            updateValues.push(id);
            await dbExecute(
              `UPDATE project_configs SET ${updateFields.join(", ")} WHERE project_id = ?`,
              updateValues,
              connection
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
              section_collage_enabled, section_location_enabled, section_key_features_enabled,
              hero_title, hero_subtitle,
              info_title, info_firstdescription, info_seconddescription,
              stats_config,
              highlight_title, highlight_paragraph,
              google_map_embed_url,
              collage_show_more_limit, collage_layout_pattern,
              key_features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
              sections?.keyFeatures ? 1 : 1,
              hero?.title ?? null,
              hero?.subtitle ?? null,
              info?.title ?? null,
              info?.firstDescription ?? null,
              info?.secondDescription ?? null,
              stats && stats.length > 0 ? JSON.stringify(stats) : JSON.stringify([]),
              highlight?.title ?? null,
              highlight?.paragraph ?? null,
              location?.googleMapEmbedUrl ?? null,
              collage?.showMoreLimit ?? 6,
              collage?.layoutPattern ?? "modulo-6",
              JSON.stringify(keyFeatures || {
                heading: "Key Features",
                paragraph: "Modern responsive layout for every device",
                features: []
              }),
            ],
            connection
          );
          console.log("✅ New project configs inserted");
        }
      }

      // 4. Handle downloads
      console.log("🗑️ Deleting all existing downloads");
      await dbExecute(
        `DELETE pd, pf FROM project_downloads pd 
         JOIN project_files pf ON pd.file_id = pf.id 
         WHERE pd.project_id = ?`,
        [id],
        connection
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
          connection
        );

        await dbExecute(
          `INSERT INTO project_downloads (id, project_id, download_type, title, file_id)
           VALUES (?, ?, 'brochure', ?, ?)`,
          [randomUUID(), id, brochureTitle, brochureFileId],
          connection
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
          connection
        );

        await dbExecute(
          `INSERT INTO project_downloads (id, project_id, download_type, title, file_id)
           VALUES (?, ?, 'document', ?, ?)`,
          [randomUUID(), id, documentTitle, documentFileId],
          connection
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
      { status: 500 }
    );
  }
}