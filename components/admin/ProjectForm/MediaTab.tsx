//components/admin/ProjectForm/MediaTab.tsx


"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { ProjectFormState, SectionName, PageSectionName } from "@/types/project";
 

interface Props {
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState | null>>;
  onUpload: (section: SectionName, files: FileList | null) => void;
  onRemove: (section: SectionName, index: number, isExisting: boolean) => void;
}

const MEDIA_SECTIONS: {
  id: PageSectionName; // ✅ Use PageSectionName for config.sections
  label: string;
  description: string;
  hint: string;
}[] = [
  {
    id: "media",
    label: "Media Reports",
    description: "Press coverage, news articles, and media mentions",
    hint: "Upload multiple images • JPG/PNG • Max 10MB each",
  },
  {
    id: "units",
    label: "Unit Plans",
    description: "Floor plans, layouts, and unit configurations",
    hint: "Upload multiple images • PNG with transparency works best",
  },
  {
    id: "collage",
    label: "Site Gallery",
    description: "General photos of the property, amenities, and surroundings",
    hint: "Upload multiple images for auto-arranged gallery",
  },
];

export function MediaTab({ form, setForm, onUpload, onRemove }: Props) {
  const [pendingUrls, setPendingUrls] = useState<Record<string, string>>({});

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingUrls]);

  // ✅ Toggle section enabled/disabled (stored in config.sections)
  const toggleSectionEnabled = useCallback(
    (sectionId: PageSectionName) => {
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          config: {
            ...prev.config,
            sections: {
              ...prev.config.sections,
              [sectionId]: !prev.config.sections[sectionId],
            },
          },
        };
      });
    },
    [setForm],
  );

  const handleFileSelect = useCallback(
    (section: PageSectionName, e: React.ChangeEvent<HTMLInputElement>) => {
      onUpload(section, e.target.files);
      e.target.value = ""; // Reset for re-upload
    },
    [onUpload],
  );

  const getDisplayFiles = useCallback(
    (section: PageSectionName) => {
      const existing = form.existingFiles[section] || [];
      const pending = form.files[section] || [];

      return [
        ...existing.map((file) => ({
          ...file,
          src: file.src || "",
          is_pending: false,
        })),
        ...pending.map((file, i) => {
          const key = `${section}-pending-${i}`;
          let url = pendingUrls[key];
          if (!url) {
            url = URL.createObjectURL(file);
            setPendingUrls((prev) => ({ ...prev, [key]: url }));
          }
          return {
            id: key,
            src: url,
            file_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            alt_text: "",
            sort_order: existing.length + i,
            is_pending: true,
          };
        }),
      ];
    },
    [form.existingFiles, form.files, pendingUrls],
  );

  const handleRemove = useCallback(
    (section: PageSectionName, index: number, isExisting: boolean) => {
      if (!isExisting) {
        const key = `${section}-pending-${index}`;
        if (pendingUrls[key]) {
          URL.revokeObjectURL(pendingUrls[key]);
          setPendingUrls((prev) => {
            const { [key]: _, ...rest } = prev;
            return rest;
          });
        }
      }
      onRemove(section, index, isExisting);
    },
    [onRemove, pendingUrls],
  );

  return (
    <div className="space-y-8">
      {MEDIA_SECTIONS.map((section) => {
        const isEnabled = form.config.sections[section.id];
        const files = getDisplayFiles(section.id);

        return (
          <div
            key={section.id}
            className={`border rounded-xl p-6 transition-all ${
              isEnabled
                ? "border-green-900/40 bg-neutral-900"
                : "border-green-900/30 bg-neutral-900/50 opacity-75"
            }`}
          >
            {/* Header with Toggle */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-white">
                    {section.label}
                  </h4>
                  {/* Visibility Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      isEnabled
                        ? "bg-green-900/30 text-green-500"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hidden
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{section.description}</p>
                <p className="text-xs text-neutral-500 mt-1">{section.hint}</p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleSectionEnabled(section.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  isEnabled ? "bg-green-700" : "bg-neutral-700"
                }`}
                aria-pressed={isEnabled}
                aria-label={`${isEnabled ? "Hide" : "Show"} ${section.label}`}
                title={`${isEnabled ? "Hide" : "Show"} section on public site`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Content - Only Interactive When Enabled */}
            {isEnabled ? (
              <>
                {/* Upload Area */}
                <div className="border-2 border-dashed border-green-900/40 rounded-lg p-6 text-center hover:border-green-700/60 transition bg-black/30">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(section.id, e)}
                    className="hidden"
                    id={`upload-${section.id}`}
                  />
                  <label
                    htmlFor={`upload-${section.id}`}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-white">
                      Upload Images
                    </p>
                    <p className="text-xs text-neutral-500">
                      Click or drag files here
                    </p>
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((file, index) => (
                      <div
                        key={file.id}
                        className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-green-900/30"
                      >
                        <Image
                          src={file.src}
                          alt={file.alt_text || file.file_name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRemove(section.id, index, !file.is_pending)}
                            className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Badges */}
                        {file.is_pending && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] bg-green-700 text-white rounded">
                            New
                          </span>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] bg-black/70 text-white truncate">
                          {file.file_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Disabled State Placeholder */
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800 mb-3">
                  <EyeOff className="w-8 h-8 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-400">
                  This section is hidden from the public site.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Toggle the switch above to enable and upload content.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Helper Note */}
      <div className="p-4 bg-green-900/20 border border-green-900/40 rounded-lg">
        <p className="text-sm text-green-600">
          💡 <strong>Tip:</strong> Disabled sections won't load on the public site, 
          improving page performance. Images are automatically compressed before saving.
        </p>
      </div>
    </div>
  );
}