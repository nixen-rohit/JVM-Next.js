// app/(admin)/admin/projects/[id]/page.tsx

"use client";
import { invalidateProjectCache } from "@/lib/invalidateCache";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { ProjectFormState, SectionName } from "@/types/project";

import { markProjectsChanged } from "@/lib/navbarCache";
import { compressImage, getFileType } from "@/lib/imageCompression";
import { BasicInfoTab } from "@/components/admin/ProjectForm/BasicInfoTab";
import { SectionsTab } from "@/components/admin/ProjectForm/SectionsTab";
import { MediaTab } from "@/components/admin/ProjectForm/MediaTab";
import { DownloadsTab } from "@/components/admin/ProjectForm/DownloadsTab";

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "sections", label: "Section Settings" },
  { id: "media", label: "Media & Images" },
  { id: "downloads", label: "Downloads" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [form, setForm] = useState<ProjectFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null); // ← ADD THIS

  useEffect(() => {
    if (projectId && typeof projectId === "string" && projectId.length > 0) {
      fetchProject();
    }
  }, [projectId]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchProject = async () => {
    console.log("🔍 [EDIT PAGE] Fetching project:", {
      rawId: params.id,
      projectId,
      idType: typeof projectId,
    });

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        credentials: "include", // ✅ MUST have this
        headers: { Accept: "application/json" },
      });

      console.log("🔍 [EDIT PAGE] Response:", {
        status: res.status,
        ok: res.ok,
        url: `/api/projects/${projectId}`,
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("🔍 [EDIT PAGE] Error response:", data);
        throw new Error(data.error || "Failed to fetch");
      }

      const data = await res.json();
      console.log("🔍 [EDIT PAGE] Success data keys:", Object.keys(data));

      console.log("🔍 [FRONTEND] Full API response:", data);
console.log("🔍 [FRONTEND] Config received:", data.config);
console.log("🔍 [FRONTEND] Stats received:", data.config?.stats);
console.log("🔍 [FRONTEND] Stats type:", typeof data.config?.stats);
console.log("🔍 [FRONTEND] Is array:", Array.isArray(data.config?.stats));

// ✅ Ensure stats is always an array
    const statsArray = Array.isArray(data.config?.stats) ? data.config.stats : [];
    console.log("✅ Processed stats array:", statsArray);


      setForm({
        project: {
          name: data.project.name,
          slug: data.project.slug,
          status: data.project.status,
          is_published: data.project.is_published,
        },
         config: {
        ...data.config,
        stats: statsArray, // Ensure stats is an array
      },
        files: {} as Record<SectionName, File[]>,
        existingFiles: data.files || {},
        downloads:
          data.downloads?.reduce((acc: any, d: any) => {
            acc[d.type] = { title: d.title, existingFileId: d.file?.id };
            return acc;
          }, {}) || {},
      });
    } catch (err) {
      console.error("🔍 [EDIT PAGE] Fetch error:", err);
      alert("Failed to load project");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(
    async (
      section: SectionName,
      files: FileList | null,
      isDownload?: "brochure" | "document",
    ) => {
      if (!files || !form) return;
      const newFiles: File[] = [];

      for (const file of Array.from(files)) {
        const type = getFileType(file);
        if (type === "image") {
          try {
            const compressed = await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
            newFiles.push(compressed);
          } catch {
            newFiles.push(file);
          }
        } else {
          newFiles.push(file);
        }
      }

      setForm((prev) => {
        if (!prev) return prev;
        if (isDownload) {
          return {
            ...prev,
            downloads: {
              ...prev.downloads,
              [isDownload]: {
                ...prev.downloads[isDownload],
                file: newFiles[0],
                title:
                  prev.downloads[isDownload]?.title ||
                  newFiles[0]?.name.replace(/\.[^/.]+$/, ""),
              },
            },
          };
        }
        return {
          ...prev,
          files: {
            ...prev.files,
            [section]: [...(prev.files[section] || []), ...newFiles],
          },
        };
      });
    },
    [form],
  );

  const removeFile = useCallback(
    (section: SectionName, index: number, isExisting: boolean) => {
      setForm((prev) => {
        if (!prev) return prev;
        if (isExisting) {
          const existingFiles = { ...prev.existingFiles };
          existingFiles[section] = existingFiles[section].filter(
            (_, i) => i !== index,
          );
          return { ...prev, existingFiles };
        }
        const files = { ...prev.files };
        files[section] = files[section].filter((_, i) => i !== index);
        return { ...prev, files };
      });
    },
    [],
  );

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();

      // ✅ Send project data
      const projectData = {
        ...form.project,
        is_published: form.project.is_published ? 1 : 0,
      };
      formData.append("project", JSON.stringify(projectData));

      
      // In handleSave - 
      const cleanConfig = JSON.parse(JSON.stringify(form.config));
      if (cleanConfig.stats && cleanConfig.stats.length === 0) {
        delete cleanConfig.stats;
      }
      if (cleanConfig.sections?.collage && !cleanConfig.collage) {
        cleanConfig.collage = {
          showMoreLimit: 6,
          layoutPattern: "modulo-6",
        };
      }
      formData.append("config", JSON.stringify(cleanConfig));

      // ✅ CRITICAL: Send IDs of existing files to KEEP
      const keepFileIds: string[] = [];

      // Collect all existing file IDs that are still present
      Object.entries(form.existingFiles).forEach(([section, files]) => {
        files.forEach((file) => {
          if (file.id && !file.is_pending) {
            keepFileIds.push(file.id);
          }
        });
      });

      console.log("📦 Keeping file IDs:", keepFileIds);
      formData.append("keepFileIds", JSON.stringify(keepFileIds));

      // ✅ Handle new file uploads
      const fileMetadata: any[] = [];
      Object.entries(form.files).forEach(([section, files]) => {
        files.forEach((file, index) => {
          formData.append("files", file);
          fileMetadata.push({
            section_name: section,
            file_type: getFileType(file),
            mime_type: file.type,
            file_name: file.name,
            alt_text: "",
            sort_order: index,
          });
        });
      });

      if (fileMetadata.length > 0) {
        formData.append("fileMetadata", JSON.stringify(fileMetadata));
      }

      // ✅ Handle brochure & document (unchanged)
      const brochureData = form.downloads.brochure;
      if (brochureData?.file) {
        formData.append("brochureFile", brochureData.file);
        formData.append("brochureTitle", brochureData.title || "");
      } else if (brochureData?.existingFileId) {
        formData.append("brochureKeep", "true");
        formData.append("brochureTitle", brochureData.title || "");
        formData.append("brochureExistingId", brochureData.existingFileId);
      } else {
        formData.append("brochureDelete", "true");
      }

      const documentData = form.downloads.document;
      if (documentData?.file) {
        formData.append("documentFile", documentData.file);
        formData.append("documentTitle", documentData.title || "");
      } else if (documentData?.existingFileId) {
        formData.append("documentKeep", "true");
        formData.append("documentTitle", documentData.title || "");
        formData.append("documentExistingId", documentData.existingFileId);
      } else {
        formData.append("documentDelete", "true");
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        invalidateProjectCache();
        markProjectsChanged();
        router.refresh();
        setTimeout(() => {
          router.push("/admin/projects");
        }, 1000);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  // ── Delete ─────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    // ✅ Validate UUID string format
    const isValidUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        projectId,
      );

    if (!projectId || typeof projectId !== "string" || !isValidUuid) {
      console.error("🗑️ [FRONTEND] Invalid projectId:", {
        value: projectId,
        type: typeof projectId,
        isValidUuid,
      });
      setDeleteError("Invalid project ID. Please refresh and try again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      console.log("🗑️ [FRONTEND] Response:", {
        status: res.status,
        ok: res.ok,
      });

      if (res.ok) {
        invalidateProjectCache(); // ✅ Invalidate cache
        router.refresh();
      }

      // ✅ Invalidate navbar cache when project is deleted
      markProjectsChanged();

      setTimeout(() => {
        router.push("/admin/projects");
        router.refresh();
      }, 300);
    } catch (err) {
      console.error("🗑️ [FRONTEND] Delete error:", err);
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load project data
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* ── Page Header ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {form.project.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-gray-500">
              ID: {projectId?.slice(0, 8)}... {/* Shows "a1b2c3d4..." */}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Delete */}
            <button
              onClick={() => {
                setDeleteError(null); // Clear old errors
                setShowDeleteConfirm(true);
              }}
              disabled={saving || isDeleting} // ✅ Disable during delete
              className="inline-flex items-center gap-2 rounded-lg border border-red-900/40 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-900/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            {/* Cancel */}
            <button
              onClick={() => router.back()}
              disabled={saving}
              className="rounded-lg border border-green-900/40 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-900/20 transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* ── Save Error ── */}
        {saveError && (
          <div className="mb-5 rounded-xl border border-red-900/30 bg-red-900/10 p-4 text-sm text-red-400">
            {saveError}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="mb-6 border-b border-green-900/30">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-500"
                    : "border-transparent text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className="rounded-2xl border text-white border-green-900/40 bg-black p-5 shadow-2xl shadow-green-900/10 sm:p-6">
          {activeTab === "basic" && (
            <BasicInfoTab form={form} setForm={setForm} />
          )}
          {activeTab === "sections" && (
            <SectionsTab
              form={form}
              setForm={setForm}
              onUpload={handleFileUpload} // ← Pass existing handler
              onRemove={removeFile} // ← Pass existing handler
            />
          )}
          {activeTab === "media" && (
            <MediaTab
              form={form}
              setForm={setForm}
              onUpload={handleFileUpload}
              onRemove={removeFile}
            />
          )}
          {activeTab === "downloads" && (
            <DownloadsTab
              form={form}
              setForm={setForm}
              onUpload={handleFileUpload}
            />
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
            >
              {/* Modal header */}
              <div className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-red-900/40 bg-red-900/20">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">
                  Delete Project
                </h3>

                {/* ✅ Delete error display - inside modal */}
                {deleteError && (
                  <div className="mb-4 rounded-lg border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
                    {deleteError}
                  </div>
                )}

                <p className="text-sm leading-relaxed text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-white">
                    {form?.project?.name || "this project"}
                  </span>
                  ? This action cannot be undone — all associated files, media,
                  and settings will be permanently removed.
                </p>
              </div>

              {/* Modal actions */}
              <div className="flex justify-end gap-3 border-t border-neutral-800 bg-neutral-900/50 px-6 py-4">
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setShowDeleteConfirm(false);
                  }}
                  disabled={isDeleting}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                {/* Modal actions */}
                <button
                  onClick={confirmDelete}
                  disabled={
                    isDeleting ||
                    !projectId ||
                    typeof projectId !== "string" ||
                    projectId.trim() === ""
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-500 hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete permanently"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
