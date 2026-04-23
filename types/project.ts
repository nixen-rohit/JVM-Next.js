// types/project.ts

// ── Enums & Unions ──────────────────────────────────────────────────────────
export type ProjectStatus = "ongoing" | "sold" | "upcoming";
export type FileType = "image" | "pdf";
export type CollageLayout = "modulo-6" | "masonry" | "grid";

// ── Section Names ───────────────────────────────────────────────────────────
// Page sections that appear in config.sections (for toggling visibility)
export type PageSectionName =
  | "hero"
  | "info"
  | "stats"
  | "highlight"
  | "media"
  | "units"
  | "collage"
  | "location";

// All section names (includes download types for file organization)
export type SectionName = PageSectionName | "brochure" | "document";

// ── Stats Configuration ─────────────────────────────────────────────────────
export type StatField =
  | "location"
  | "surfaceArea"
  | "completed"
  | "value"
  | "architect"
  | "category";

export interface StatItem {
  icon: StatField | string; // Allow custom icons if needed
  title: string;
  desc: string;
  highlightParagraph?: string;
}

// ── Project Entity (Database) ───────────────────────────────────────────────
export interface Project {
  id: string; // UUID string
  name: string;
  slug: string;
  status: ProjectStatus;
  is_published: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// ── Sections Config (Type-Safe Record) ──────────────────────────────────────
// ✅ This allows safe indexing: config.sections[sectionId] where sectionId: PageSectionName
export type ProjectSectionsConfig = Record<PageSectionName, boolean>;

// ── Project Config (Database + UI) ──────────────────────────────────────────
export interface ProjectConfig {
  id?: number; // DB auto-increment (optional for forms)
  project_id?: string; // UUID string (optional for forms) - CHANGED: number → string

  // Section visibility toggles
  sections: ProjectSectionsConfig;

  // Section-specific configurations (all fields optional with ?)
  hero?: {
    title?: string;
    subtitle?: string;
  };
  info?: {
    title?: string;
    firstDescription?: string;
    secondDescription?: string;
  };
  stats?: StatItem[];
  highlight?: {
    title?: string;
    paragraph?: string;
  };
  location?: {
    googleMapEmbedUrl?: string;
  };
  collage?: {
    showMoreLimit?: number;
    layoutPattern?: CollageLayout;
  };

  // Allow dynamic keys for flexibility (e.g., future sections)
  [key: string]: any;
}

// ── Project File (Database Entity - NO UI STATE) ────────────────────────────
export interface ProjectFile {
  id: string; // UUID string
  project_id: string; // UUID string (matches Project.id) - CHANGED: number → string
  section_name: SectionName;
  file_type: FileType;
  mime_type: string;
  file_name: string;
  src: string; // API endpoint or data URL
  thumbnailSrc?: string;
  alt_text?: string;
  sort_order: number;
  is_active: boolean;
  uploaded_at: string; // ISO date string
  file_size: number; // in bytes
  is_pending?: boolean;

  // ❌ REMOVED: is_pending (this is UI-only state, not a DB field)
}

// ── Display File (UI Layer - Extends DB Entity with UI State) ───────────────
export interface DisplayFile extends Omit<ProjectFile, "id"> {
  id: string; // Can be UUID or temp ID like "pending-0"
  src: string; // data URL for preview or API endpoint
  is_pending?: boolean; // ✅ UI-only flag for unsaved uploads
}

// ── Project Download ────────────────────────────────────────────────────────
export interface ProjectDownload {
  id: string; // UUID string - CHANGED: number → string
  project_id: string; // UUID string - CHANGED: number → string
  type: "brochure" | "document";
  title: string;
  file: {
    src: string;
    name: string;
    mime: string;
  };
  is_active: boolean;
}

// ── API Response Types ──────────────────────────────────────────────────────
export interface ProjectDetailResponse {
  project: Project;
  config: ProjectConfig;
  files: Record<SectionName, ProjectFile[]>;
  downloads: ProjectDownload[];
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface ApiSuccess {
  success: true;
  message?: string;
  data?: any;
}

// ── Form State (UI Layer - SINGLE DEFINITION) ───────────────────────────────
export interface ProjectFormState {
  // Project basics (excluding DB-only fields)
  project: Omit<Project, "id" | "created_at" | "updated_at">;

  // Config (excluding DB-only fields)
  config: Omit<ProjectConfig, "id" | "project_id">;

  // Pending file uploads (File objects, not yet saved to DB)
  files: Record<SectionName, File[]>;

  // Saved files from DB (ProjectFile objects)
  existingFiles: Record<SectionName, ProjectFile[]>;

  // Downloads UI state (brochure/document) - FIXED structure
  downloads: {
    brochure?: {
      title: string;
      file?: File; // pending upload
      existingFileId?: string; // saved file ID from DB - CHANGED: number → string
    };
    document?: {
      title: string;
      file?: File;
      existingFileId?: string; // CHANGED: number → string
    };
  };

  // Form validation errors (optional)
  errors?: Record<string, string>;
}
