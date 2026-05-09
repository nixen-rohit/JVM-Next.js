"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  MapPin,
  BarChart3,
  Building2,
  Calendar,
  IndianRupee,
  Ruler,
  Tag,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  ListChecks,
  Trash2,
} from "lucide-react";

import {
  ProjectFormState,
  SectionName,
  PageSectionName,
  StatItem,
} from "@/types/project";

interface Props {
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState | null>>;
  onUpload: (section: SectionName, files: FileList | null) => void;
  onRemove: (section: SectionName, index: number, isExisting: boolean) => void;
}

type SectionConfig = {
  id: PageSectionName;
  label: string;
  description: string;
  icon: React.ReactNode;
  hasConfig: boolean;
  hasFiles: boolean;
  fileLabel?: string;
  fileHint?: string;
  accept?: string;
  multiple?: boolean; // ✅ Add multiple flag
  maxFiles?: number; // ✅ Add max files limit
};

type StatField =
  | "location"
  | "surfaceArea"
  | "completed"
  | "value"
  | "architect"
  | "category";

type FeatureItem = {
  id: string;
  text: string;
};

const STAT_FIELDS: {
  id: StatField;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type: "text" | "select";
  options?: string[];
}[] = [
  {
    id: "location",
    label: "LOCATION",
    placeholder: "e.g., Gurgaon, India",
    icon: <MapPin className="w-4 h-4 text-green-600" />,
    type: "text",
  },
  {
    id: "surfaceArea",
    label: "SURFACE AREA",
    placeholder: "e.g., 120,000 sq ft",
    icon: <Ruler className="w-4 h-4 text-green-600" />,
    type: "text",
  },
  {
    id: "completed",
    label: "COMPLETED",
    placeholder: "e.g., 2024",
    icon: <Calendar className="w-4 h-4 text-green-600" />,
    type: "text",
  },
  {
    id: "value",
    label: "VALUE",
    placeholder: "e.g., ₹ 250 Cr",
    icon: <IndianRupee className="w-4 h-4 text-green-600" />,
    type: "text",
  },
  {
    id: "architect",
    label: "ARCHITECT",
    placeholder: "e.g., ABC Designs",
    icon: <Building2 className="w-4 h-4 text-green-600" />,
    type: "text",
  },
  {
    id: "category",
    label: "CATEGORY",
    placeholder: "Select category",
    icon: <Tag className="w-4 h-4 text-green-600" />,
    type: "select",
    options: ["Residential", "Commercial", "Mixed-Use", "Luxury", "Affordable"],
  },
];

const SECTIONS: SectionConfig[] = [
  {
    id: "hero",
    label: "Hero Section",
    description: "Full-screen banner with title & subtitle",
    icon: <ImageIcon className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: true,
    fileLabel: "Hero Image",
    fileHint: "1920x1080 recommended • JPG/PNG • Only one image allowed",
    accept: "image/*",
    multiple: false, // ✅ Single image only
    maxFiles: 1,
  },
  {
    id: "info",
    label: "Info Section",
    description: "Project description + details card",
    icon: <FileText className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: false,
  },
  {
    id: "keyFeatures",
    label: "Key Features Section",
    description: "Manage homepage features/benefits list",
    icon: <ListChecks className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: false,
  },
  {
    id: "stats",
    label: "Stats Section",
    description: "Key metrics with icons (Location, Area, Value, etc.)",
    icon: <BarChart3 className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: false,
  },
  {
    id: "highlight",
    label: "Highlight Section",
    description: "Featured content with background image",
    icon: <ImageIcon className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: true,
    fileLabel: "Highlight Image",
    fileHint: "1200x800 recommended • JPG/PNG • Only one image allowed",
    accept: "image/*",
    multiple: false, // ✅ Single image only
    maxFiles: 1,
  },
  {
    id: "location",
    label: "Location Section",
    description: "Paper map + Google Maps embed",
    icon: <MapPin className="w-5 h-5 text-green-600" />,
    hasConfig: true,
    hasFiles: true,
    fileLabel: "Paper Map Image",
    fileHint: "Upload a static map image • Only one image allowed",
    accept: "image/*",
    multiple: false, // ✅ Single image only
    maxFiles: 1,
  },
];

export function SectionsTab({ form, setForm, onUpload, onRemove }: Props) {
  const [expandedSection, setExpandedSection] = useState<SectionName | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  useEffect(() => {
    // Log current stats when component mounts or updates
    console.log("🎨 [SectionsTab] Current stats in form:", form.config.stats);
    console.log("🎨 [SectionsTab] Stats type:", typeof form.config.stats);
    console.log("🎨 [SectionsTab] Is array:", Array.isArray(form.config.stats));

    // If stats exist, log each value
    if (form.config.stats && Array.isArray(form.config.stats)) {
      form.config.stats.forEach((stat: StatItem) => {
        console.log(`📊 Stat: ${stat.icon} = ${stat.title}`);
      });
    }
  }, [form.config.stats]);

  // useRef cache to avoid creating new object URLs on every render
  const pendingUrlsRef = useRef<Record<string, string>>({});

  console.log("🎨 [SectionsTab] Rendering with config:", form.config);
  console.log("🎨 [SectionsTab] Stats in form.config:", form.config.stats);
  console.log("🎨 [SectionsTab] Stats type:", typeof form.config.stats);
  console.log("🎨 [SectionsTab] Is array:", Array.isArray(form.config.stats));

  useEffect(() => {
    return () => {
      Object.values(pendingUrlsRef.current).forEach(URL.revokeObjectURL);
    };
  }, []);

  const toggleSection = useCallback(
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
      const sections = form.config.sections as Record<PageSectionName, boolean>;
      if (!sections[sectionId]) {
        setExpandedSection(sectionId as SectionName);
      }
    },
    [form.config.sections, setForm],
  );

  const toggleExpand = useCallback((sectionId: SectionName) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const updateConfig = useCallback(
    (section: SectionName, field: string, value: any) => {
      setForm((prev) => {
        if (!prev) return prev;

        const existingSection = (prev.config as any)[section] || {};

        const updatedSection = {
          ...existingSection,
          [field]: value,
        };

        // Return new form state
        return {
          ...prev,
          config: {
            ...prev.config,
            [section]: updatedSection,
          },
        };
      });
    },
    [setForm],
  );

  const updateStatField = useCallback(
    (field: StatField, value: string) => {
      setForm((prev) => {
        if (!prev) return prev;
        const existingStats: StatItem[] = prev.config.stats || [];
        const existingIndex = existingStats.findIndex(
          (s: StatItem) => s.icon === field,
        );

        let newStats;
        if (existingIndex >= 0) {
          newStats = existingStats.map((s, i) =>
            i === existingIndex ? { ...s, title: value } : s,
          );
        } else {
          newStats = [
            ...existingStats,
            { icon: field, title: value, desc: "" },
          ];
        }

        return { ...prev, config: { ...prev.config, stats: newStats } };
      });
    },
    [setForm],
  );

  const getStatValue = useCallback(
    (field: StatField): string => {
      if (!form.config.stats || !Array.isArray(form.config.stats)) {
        console.log(`⚠️ No stats array found for field: ${field}`);
        return "";
      }

      const stat = form.config.stats.find((s: StatItem) => s.icon === field);
      const value = stat?.title || "";

      // Log to verify
      if (value) {
        console.log(`✅ Found value for ${field}: ${value}`);
      }

      return value;
    },
    [form.config.stats],
  );

  // ✅ Modified handleFileSelect with single file limit check
  const handleFileSelect = useCallback(
    (
      section: SectionName,
      sectionConfig: SectionConfig,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Clear previous error for this section
      setUploadError((prev) => {
        const { [section]: _, ...rest } = prev;
        return rest;
      });

      // Check if single file section already has a file
      if (!sectionConfig.multiple && sectionConfig.maxFiles === 1) {
        const existingFiles = form.existingFiles[section] || [];
        const pendingFiles = form.files[section] || [];
        const totalFiles = existingFiles.length + pendingFiles.length;

        if (totalFiles >= 1) {
          setUploadError((prev) => ({
            ...prev,
            [section]: `Only one image is allowed. Please remove the existing image first.`,
          }));
          e.target.value = ""; // Reset input
          return;
        }
      }

      // For single file sections, only take the first file
      const filesToUpload =
        sectionConfig.multiple === false && sectionConfig.maxFiles === 1
          ? [files[0]]
          : Array.from(files);

      // Create a new FileList-like object or just pass the files
      const dataTransfer = new DataTransfer();
      filesToUpload.forEach((file) => dataTransfer.items.add(file));

      onUpload(section, dataTransfer.files);
      e.target.value = "";
    },
    [form.existingFiles, form.files, onUpload],
  );

  const getFilesForSection = useCallback(
    (section: SectionName) => {
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
          if (!pendingUrlsRef.current[key]) {
            pendingUrlsRef.current[key] = URL.createObjectURL(file);
          }
          return {
            id: key,
            src: pendingUrlsRef.current[key],
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
    [form.existingFiles, form.files],
  );

  // ✅ Handle remove with proper cleanup
  const handleRemove = useCallback(
    (section: SectionName, index: number, isExisting: boolean) => {
      // Clear any upload error for this section
      setUploadError((prev) => {
        const { [section]: _, ...rest } = prev;
        return rest;
      });

      // Clean up object URL if it's a pending file
      if (!isExisting) {
        const key = `${section}-pending-${index}`;
        if (pendingUrlsRef.current[key]) {
          URL.revokeObjectURL(pendingUrlsRef.current[key]);
          delete pendingUrlsRef.current[key];
        }
      }

      onRemove(section, index, isExisting);
    },
    [onRemove],
  );

  // Add this after your existing useEffects
  useEffect(() => {
    // Initialize keyFeatures if it doesn't exist
    if (!form.config.keyFeatures) {
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          config: {
            ...prev.config,
            keyFeatures: {
              heading: "",
              paragraph: "",
              features: [],
            },
          },
        };
      });
    }
  }, [form.config.keyFeatures, setForm]);

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const isEnabled = form.config.sections[section.id];
        const files = getFilesForSection(section.id);
        const isExpanded = expandedSection === section.id;
        const hasError = !!uploadError[section.id];
        const isSingleFileSection =
          section.multiple === false && section.maxFiles === 1;
        const hasFile = files.length > 0;

        return (
          <div
            key={section.id}
            className={`border rounded-xl transition-all ${
              isEnabled
                ? "border-green-900/40 bg-green-900/10"
                : "border-green-900/30 bg-neutral-900/50 opacity-75"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  isEnabled ? "bg-green-700" : "bg-neutral-700"
                }`}
                aria-pressed={isEnabled}
                aria-label={`${isEnabled ? "Hide" : "Show"} ${section.label}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => toggleExpand(section.id as SectionName)}
                className="flex flex-1 items-center gap-2 text-left min-w-0"
              >
                <span className={isEnabled ? "text-white" : "text-neutral-500"}>
                  {section.icon}
                </span>
                <span
                  className={`text-sm font-medium truncate ${
                    isEnabled ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {section.label}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                {/* ✅ Show file count badge for single file sections */}
                {isSingleFileSection && hasFile && isEnabled && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                    {hasFile ? "1/1" : "0/1"}
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isEnabled
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                  }`}
                >
                  {isEnabled ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {isEnabled ? "Visible" : "Hidden"}
                </span>

                <button
                  type="button"
                  onClick={() => toggleExpand(section.id as SectionName)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
              <div className="border-t border-green-900/30">
                {isEnabled ? (
                  <div className="px-4 pb-4 pt-4 space-y-4">
                    <p className="text-sm text-neutral-400">
                      {section.description}
                    </p>

                    {/* ✅ Show error message */}
                    {hasError && (
                      <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/40 text-red-400 text-sm">
                        {uploadError[section.id]}
                      </div>
                    )}

                    {section.hasConfig && (
                      <div className="space-y-3">
                        {/* Hero */}
                        {section.id === "hero" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={form.config.hero?.title || ""}
                                onChange={(e) =>
                                  updateConfig("hero", "title", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                                placeholder="Green Valley Residences"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Subtitle
                              </label>
                              <input
                                type="text"
                                value={form.config.hero?.subtitle || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "hero",
                                    "subtitle",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                                placeholder="Modern Living Redefined"
                              />
                            </div>
                          </>
                        )}

                        {/* Key Features Section */}
                        {section.id === "keyFeatures" && (
                          <div className="space-y-4">
                            {/* Heading Field */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Section Heading
                              </label>
                              <input
                                type="text"
                                value={form.config.keyFeatures?.heading || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "keyFeatures",
                                    "heading",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                                placeholder="Key Features"
                              />
                            </div>

                            {/* Sub Paragraph Field */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Sub Paragraph
                              </label>
                              <textarea
                                value={form.config.keyFeatures?.paragraph || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "keyFeatures",
                                    "paragraph",
                                    e.target.value,
                                  )
                                }
                                rows={2}
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition resize-y"
                                placeholder="Brief description about the features section"
                              />
                            </div>

                            {/* Features List with Plus Button */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-white">
                                  Features / Bullet Points
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentFeatures =
                                      form.config.keyFeatures?.features || [];
                                    updateConfig("keyFeatures", "features", [
                                      ...currentFeatures,
                                      { id: crypto.randomUUID(), text: "" },
                                    ]);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-500 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Feature
                                </button>
                              </div>

                              <div className="space-y-2">
                                {(form.config.keyFeatures?.features || []).map(
                                  (feature: any, index: number) => (
                                    <div
                                      key={feature.id || index}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="shrink-0 mt-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full block"></span>
                                      </div>
                                      <input
                                        type="text"
                                        value={feature.text || ""}
                                        onChange={(e) => {
                                          const newFeatures = [
                                            ...(form.config.keyFeatures
                                              ?.features || []),
                                          ];
                                          newFeatures[index] = {
                                            ...feature,
                                            text: e.target.value,
                                          };
                                          updateConfig(
                                            "keyFeatures",
                                            "features",
                                            newFeatures,
                                          );
                                        }}
                                        placeholder="Enter feature description..."
                                        className="flex-1 px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition text-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newFeatures = (
                                            form.config.keyFeatures?.features ||
                                            []
                                          ).filter(
                                            (_: any, i: number) => i !== index,
                                          );
                                          updateConfig(
                                            "keyFeatures",
                                            "features",
                                            newFeatures,
                                          );
                                        }}
                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
                                        title="Remove feature"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ),
                                )}

                                {(form.config.keyFeatures?.features || [])
                                  .length === 0 && (
                                  <p className="text-sm text-neutral-500 italic text-center py-4">
                                    No features added. Click "Add Feature" to
                                    create bullet points.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Info */}
                        {section.id === "info" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Section Title
                              </label>
                              <input
                                type="text"
                                value={form.config.info?.title || ""}
                                onChange={(e) =>
                                  updateConfig("info", "title", e.target.value)
                                }
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                First Description
                              </label>
                              <textarea
                                value={form.config.info?.firstDescription || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "info",
                                    "firstDescription",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Second Description
                              </label>
                              <textarea
                                value={
                                  form.config.info?.secondDescription || ""
                                }
                                onChange={(e) =>
                                  updateConfig(
                                    "info",
                                    "secondDescription",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition resize-y"
                              />
                            </div>
                          </>
                        )}

                        {section.id === "stats" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {STAT_FIELDS.map((field) => {
                              // Get the current value for this field
                              const currentValue = getStatValue(field.id);

                              // Only show the field if it has a value OR if we're editing
                              // For admin panel, we want to show all fields so users can add values
                              return (
                                <div key={field.id} className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-medium text-white">
                                    {field.icon}
                                    {field.label}
                                  </label>
                                  {field.type === "select" ? (
                                    <select
                                      value={currentValue}
                                      onChange={(e) =>
                                        updateStatField(
                                          field.id,
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                                    >
                                      <option value="">
                                        {field.placeholder}
                                      </option>
                                      {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={currentValue}
                                      onChange={(e) =>
                                        updateStatField(
                                          field.id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Highlight */}
                        {section.id === "highlight" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={form.config.highlight?.title || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "highlight",
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Paragraph
                              </label>
                              <textarea
                                value={form.config.highlight?.paragraph || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    "highlight",
                                    "paragraph",
                                    e.target.value,
                                  )
                                }
                                rows={2}
                                className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition resize-y"
                              />
                            </div>
                          </>
                        )}

                        {/* Location */}
                        {section.id === "location" && (
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">
                              Google Maps Embed URL
                            </label>
                            <input
                              type="url"
                              value={
                                form.config.location?.googleMapEmbedUrl || ""
                              }
                              onChange={(e) =>
                                updateConfig(
                                  "location",
                                  "googleMapEmbedUrl",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                              placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="mt-1 text-xs text-neutral-500">
                              Get this from Google Maps → Share → Embed a map
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* File Upload - Modified for single file sections */}
                    {section.hasFiles && section.fileLabel && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-white">
                            {section.fileLabel}
                          </label>
                          {isSingleFileSection && (
                            <span
                              className={`text-xs ${hasFile ? "text-green-500" : "text-neutral-500"}`}
                            >
                              {hasFile
                                ? "✓ Image uploaded"
                                : "No image uploaded"}
                            </span>
                          )}
                          {!isSingleFileSection && files.length > 0 && (
                            <span className="text-xs text-neutral-400">
                              {files.length} file{files.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Show current file if exists (single file sections) */}
                        {isSingleFileSection && hasFile && (
                          <div className="relative group">
                            <div className="flex items-center gap-3 p-3 bg-black/60 rounded-lg border border-green-900/40">
                              {files[0]?.src?.startsWith("blob:") ||
                              files[0]?.src?.startsWith("data:") ? (
                                <img
                                  src={files[0].src}
                                  alt={files[0].alt_text || files[0].file_name}
                                  className="w-16 h-16 rounded object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded bg-neutral-800 flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-neutral-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {files[0].file_name}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {files[0].is_pending ? "New • " : ""}
                                  {files[0].mime_type
                                    ?.split("/")[1]
                                    ?.toUpperCase()}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(
                                    section.id,
                                    0,
                                    !files[0].is_pending,
                                  )
                                }
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
                                title="Remove image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Upload button - Hide if single file section already has a file */}
                        {(!isSingleFileSection || !hasFile) && (
                          <div className="border-2 border-dashed border-green-900/40 rounded-lg p-4 text-center hover:border-green-700/60 transition-colors bg-black/30">
                            <input
                              type="file"
                              accept={section.accept}
                              multiple={section.multiple}
                              onChange={(e) =>
                                handleFileSelect(section.id, section, e)
                              }
                              className="hidden"
                              id={`upload-${section.id}`}
                              disabled={isSingleFileSection && hasFile}
                            />
                            <label
                              htmlFor={`upload-${section.id}`}
                              className={`cursor-pointer flex flex-col items-center ${isSingleFileSection && hasFile ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-2">
                                <Upload className="w-5 h-5 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-white">
                                {isSingleFileSection && hasFile
                                  ? "Replace Image"
                                  : `Upload ${section.fileLabel}`}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {section.fileHint}
                              </p>
                            </label>
                          </div>
                        )}

                        {/* Show multiple files list for non-single sections */}
                        {!isSingleFileSection && files.length > 0 && (
                          <div className="space-y-2">
                            {files.map((file, index) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-3 p-2 bg-black/40 rounded border border-green-900/30"
                              >
                                {file.src?.startsWith("blob:") ||
                                file.src?.startsWith("data:") ? (
                                  <img
                                    src={file.src}
                                    alt={file.alt_text || file.file_name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-neutral-500" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">
                                    {file.file_name}
                                  </p>
                                  <p className="text-xs text-neutral-400">
                                    {file.is_pending ? "New • " : ""}
                                    {file.mime_type
                                      ?.split("/")[1]
                                      ?.toUpperCase()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemove(
                                      section.id,
                                      index,
                                      !file.is_pending,
                                    )
                                  }
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-sm text-neutral-500 italic">
                      Enable this section to configure content and upload files.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-6 p-4 bg-green-900/20 border border-green-900/40 rounded-lg">
        <p className="text-sm text-green-600">
          💡 <strong>Tip:</strong> Configure only the sections you need.
          Disabled sections won't appear on the public site, and their content
          won't be loaded (faster performance).
        </p>
      </div>
    </div>
  );
}
