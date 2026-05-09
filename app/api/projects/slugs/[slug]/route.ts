// app/api/projects/slugs/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { parseKeyFeatures } from "@/app/api/projects/helpers"
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log("🔍 API: Looking for project with slug:", slug);
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }
    
    // Query the database
    const [projects] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM projects WHERE slug = ? AND is_published = 1 AND status != 'sold'`,
      [slug]
    );
    
    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    const project = projects[0];
    
    // Get project config
    const [configs] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM project_configs WHERE project_id = ?`,
      [project.id]
    );
    
    const configRaw = configs[0] || {};
    
    // ✅ Safe function to parse stats_config
    function parseStatsConfig(statsConfig: any) {
      if (!statsConfig) return [];
      
      // If it's already an array, return it
      if (Array.isArray(statsConfig)) return statsConfig;
      
      // If it's a string, try to parse it
      if (typeof statsConfig === 'string') {
        try {
          const parsed = JSON.parse(statsConfig);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Failed to parse stats_config string:", e);
          return [];
        }
      }
      
      // If it's an object (but not array), try to convert
      if (typeof statsConfig === 'object') {
        console.log("stats_config is an object, attempting to use as-is");
        // If it has the expected structure, use it
        if (statsConfig.location || statsConfig.surfaceArea) {
          // Convert object to array format
          const statsArray = [];
          for (const [key, value] of Object.entries(statsConfig)) {
            if (value && typeof value === 'object') {
              statsArray.push(value);
            } else if (value) {
              statsArray.push({ icon: key, title: value, desc: "" });
            }
          }
          return statsArray.length > 0 ? statsArray : [];
        }
        return [];
      }
      
      return [];
    }
    
    // Build config object with safe parsing
    const config = {
      sections: {
        hero: configRaw.section_hero_enabled === 1,
        info: configRaw.section_info_enabled === 1,
        stats: configRaw.section_stats_enabled === 1,
        highlight: configRaw.section_highlight_enabled === 1,
        media: configRaw.section_media_enabled === 1,
        units: configRaw.section_units_enabled === 1,
        collage: configRaw.section_collage_enabled === 1,
        location: configRaw.section_location_enabled === 1,
         keyFeatures: configRaw.section_key_features_enabled === 1, 
      },
      hero: configRaw.hero_title ? {
        title: configRaw.hero_title,
        subtitle: configRaw.hero_subtitle || "",
      } : undefined,
      info: configRaw.info_title ? {
        title: configRaw.info_title,
        firstDescription: configRaw.info_firstdescription || "",
        secondDescription: configRaw.info_seconddescription || "",
      } : undefined,
      stats: parseStatsConfig(configRaw.stats_config),
      highlight: configRaw.highlight_title ? {
        title: configRaw.highlight_title,
        paragraph: configRaw.highlight_paragraph || "",
      } : undefined,
      location: configRaw.google_map_embed_url ? {
        googleMapEmbedUrl: configRaw.google_map_embed_url,
      } : undefined,
      collage: {
        showMoreLimit: configRaw.collage_show_more_limit || 6,
        layoutPattern: configRaw.collage_layout_pattern || "modulo-6",
      },
       keyFeatures: parseKeyFeatures(configRaw.key_features), 
 
    };
    
    // Get project files
    const [files] = await dbQuery<RowDataPacket[]>(
      `SELECT * FROM project_files WHERE project_id = ? AND is_active = 1`,
      [project.id]
    );
    
    // Organize files by section
    const organizedFiles: Record<string, any[]> = {};
    for (const file of files) {
      if (!organizedFiles[file.section_name]) {
        organizedFiles[file.section_name] = [];
      }
      
      const base64Data = file.file_data ? 
        Buffer.from(file.file_data).toString('base64') : '';
      
      organizedFiles[file.section_name].push({
        id: file.id,
        src: `data:${file.mime_type};base64,${base64Data}`,
        file_name: file.file_name,
        mime_type: file.mime_type,
        alt_text: file.alt_text,
        sort_order: file.sort_order,
      });
    }
    
    // Get downloads
    const [downloads] = await dbQuery<RowDataPacket[]>(
      `SELECT pd.*, pf.file_name, pf.mime_type, pf.file_data 
       FROM project_downloads pd
       JOIN project_files pf ON pd.file_id = pf.id
       WHERE pd.project_id = ? AND pd.is_active = 1`,
      [project.id]
    );
    
    const formattedDownloads = downloads.map((d: any) => ({
      id: d.id,
      type: d.download_type,
      title: d.title,
      file: {
        src: `data:${d.mime_type};base64,${Buffer.from(d.file_data).toString('base64')}`,
        name: d.file_name,
        mime: d.mime_type,
      },
    }));
    
    const response = {
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
      
        status: project.status, // ✅ 'upcoming', 'ongoing', 'sold'
        is_published: project.is_published,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      config,
      files: organizedFiles,
      downloads: formattedDownloads,
    };
    
    console.log("✅ API: Sending successful response for:", project.name);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}