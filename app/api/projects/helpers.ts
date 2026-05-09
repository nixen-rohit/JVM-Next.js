// app/api/projects/[id]/helpers.ts
import { RowDataPacket } from "mysql2";

export interface ConfigRow extends RowDataPacket {
  id: string;
  project_id: string;
  section_hero_enabled: number;
  section_info_enabled: number;
  section_stats_enabled: number;
  section_highlight_enabled: number;
  section_media_enabled: number;
  section_units_enabled: number;
  section_collage_enabled: number;
  section_location_enabled: number;
  section_key_features_enabled?: number; // ✅ Add this
  hero_title: string | null;
  hero_subtitle: string | null;
  info_title: string | null;
  info_firstdescription: string | null;
  info_seconddescription: string | null;
  stats_config: string | null;
  highlight_title: string | null;
  highlight_paragraph: string | null;
  google_map_embed_url: string | null;
  collage_show_more_limit: number;
  collage_layout_pattern: string;
  key_features?: string | null; // ✅ Add this
}

// Helper to parse stats config safely
export function parseStatsConfig(statsConfig: any): any[] {
  if (!statsConfig) return [];
  if (Array.isArray(statsConfig)) return statsConfig;
  
  if (typeof statsConfig === "string") {
    try {
      const parsed = JSON.parse(statsConfig);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Attempt to recover corrupted data
      const rawString = String(statsConfig);
      if (rawString.includes("icon") && rawString.includes("title")) {
        try {
          let fixed = rawString
            .replace(/(\w+):/g, '"$1":')
            .replace(/:\s*'([^']*)'/g, ':"$1"')
            .replace(/([^\\])' /g, '$1", ')
            .replace(/'(\w+)'/g, '"$1"');
          if (!fixed.startsWith("[")) fixed = `[${fixed}]`;
          const recovered = JSON.parse(fixed);
          return Array.isArray(recovered) ? recovered : [];
        } catch {
          return [];
        }
      }
      return [];
    }
  }
  
  return [];
}

// Helper to parse key features
 

 

interface KeyFeaturesObject {
  heading?: string;
  paragraph?: string;
  features?: Array<{ id: string; text: string }>;
}

export function parseKeyFeatures(keyFeaturesRaw: string | KeyFeaturesObject | null): any {
  console.log("🔍 Raw key_features from DB:", keyFeaturesRaw);
  console.log("🔍 Type of key_features:", typeof keyFeaturesRaw);
  
  // If it's already an object, return it directly
  if (keyFeaturesRaw && typeof keyFeaturesRaw === 'object' && !Array.isArray(keyFeaturesRaw)) {
    console.log("✅ key_features is already an object");
    return {
      heading: (keyFeaturesRaw as KeyFeaturesObject).heading || "",
      paragraph: (keyFeaturesRaw as KeyFeaturesObject).paragraph || "",
      features: (keyFeaturesRaw as KeyFeaturesObject).features || []
    };
  }
  
  // If it's null or undefined
  if (!keyFeaturesRaw) {
    console.log("⚠️ No key_features found in DB");
    return {
      heading: "",
      paragraph: "",
      features: []
    };
  }
  
  // If it's a string, try to parse it
  if (typeof keyFeaturesRaw === 'string') {
    try {
      const parsed = JSON.parse(keyFeaturesRaw) as KeyFeaturesObject;
      console.log("✅ Parsed keyFeatures from string:", parsed);
      return {
        heading: parsed.heading || "",
        paragraph: parsed.paragraph || "",
        features: parsed.features || []
      };
    } catch (error) {
      console.error("❌ Failed to parse key_features string:", error);
      return {
        heading: "",
        paragraph: "",
        features: []
      };
    }
  }
  
  return {
    heading: "",
    paragraph: "",
    features: []
  };
}
// Build config object from database row
export function buildConfig(configRaw: ConfigRow | null) {
  if (!configRaw) {
    return {
      sections: {
        hero: true,
        info: true,
        stats: true,
        highlight: true,
        media: true,
        units: true,
        collage: true,
        location: true,
        keyFeatures: true,
      },
      keyFeatures: {
        heading: "Key Features",
        paragraph: "Modern responsive layout for every device",
        features: []
      }
    };
  }

  return {
    sections: {
      hero: !!configRaw.section_hero_enabled,
      info: !!configRaw.section_info_enabled,
      stats: !!configRaw.section_stats_enabled,
      highlight: !!configRaw.section_highlight_enabled,
      media: !!configRaw.section_media_enabled,
      units: !!configRaw.section_units_enabled,
      collage: !!configRaw.section_collage_enabled,
      location: !!configRaw.section_location_enabled,
      keyFeatures: !!configRaw.section_key_features_enabled,
    },
    hero: configRaw.hero_title ? {
      title: configRaw.hero_title,
      subtitle: configRaw.hero_subtitle ?? "",
    } : undefined,
    info: configRaw.info_title ? {
      title: configRaw.info_title,
      firstDescription: configRaw.info_firstdescription ?? "",
      secondDescription: configRaw.info_seconddescription ?? "",
    } : undefined,
    stats: parseStatsConfig(configRaw.stats_config),
    highlight: configRaw.highlight_title ? {
      title: configRaw.highlight_title,
      paragraph: configRaw.highlight_paragraph ?? "",
    } : undefined,
    location: configRaw.google_map_embed_url ? {
      googleMapEmbedUrl: configRaw.google_map_embed_url,
    } : undefined,
    collage: {
      showMoreLimit: configRaw.collage_show_more_limit ?? 6,
      layoutPattern: (configRaw.collage_layout_pattern as "modulo-6" | "masonry" | "grid") ?? "modulo-6",
    },
    keyFeatures: parseKeyFeatures(configRaw.key_features as string | null),
  };
}




 