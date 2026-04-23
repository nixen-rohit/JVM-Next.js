"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Upload, X, File, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ProjectFormState, ProjectFile } from "@/types/project";
import { formatFileSize, isPdfFile } from "@/lib/imageCompression";

interface Props {
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState | null>>;
  onUpload: (
    section: "brochure" | "document",
    files: FileList | null,
    isDownload: "brochure" | "document",
  ) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ Default titles
const DEFAULT_TITLES = {
  brochure: "Project Brochure",
  document: "Project Document",
};

export function DownloadsTab({ form, setForm, onUpload }: Props) {
  const [previewUrl, setPreviewUrl] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  const [enabledDownloads, setEnabledDownloads] = useState<Record<"brochure" | "document", boolean>>({
    brochure: !!form.downloads.brochure?.title || !!form.downloads.brochure?.file || !!form.downloads.brochure?.existingFileId,
    document: !!form.downloads.document?.title || !!form.downloads.document?.file || !!form.downloads.document?.existingFileId,
  });

  useEffect(() => {
    setEnabledDownloads({
      brochure: !!form.downloads.brochure?.title || !!form.downloads.brochure?.file || !!form.downloads.brochure?.existingFileId,
      document: !!form.downloads.document?.title || !!form.downloads.document?.file || !!form.downloads.document?.existingFileId,
    });
  }, [form.downloads]);

  useEffect(() => {
    return () => {
      Object.values(previewUrl).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrl]);

  const toggleDownloadEnabled = useCallback(
    (type: "brochure" | "document") => {
      setEnabledDownloads(prev => ({ ...prev, [type]: !prev[type] }));
    },
    [],
  );

  const handleFileSelect = (
    type: "brochure" | "document",
    files: FileList | null,
  ) => {
    setUploadError((prev) => {
      const { [type]: _, ...rest } = prev;
      return rest;
    });

    if (!files?.[0]) return;
    const file = files[0];

    if (!isPdfFile(file)) {
      setUploadError((prev) => ({
        ...prev,
        [type]: "Only PDF files are allowed",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError((prev) => ({
        ...prev,
        [type]: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.`,
      }));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => ({ ...prev, [type]: url }));

    // ✅ Set default title when uploading
    const defaultTitle = DEFAULT_TITLES[type];
    
    // Update form state with file and default title
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        downloads: {
          ...prev.downloads,
          [type]: {
            title: defaultTitle,
            file: file,
          },
        },
      };
    });

    // Also call onUpload for backend handling
    onUpload(type, files, type);
  };

  const updateDownloadTitle = (
    type: "brochure" | "document",
    title: string,
  ) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        downloads: {
          ...prev.downloads,
          [type]: {
            ...prev.downloads[type],
            title: title || DEFAULT_TITLES[type], // ✅ Use default if empty
          },
        },
      };
    });
  };

  const removeDownload = (type: "brochure" | "document") => {
    if (previewUrl[type]) {
      URL.revokeObjectURL(previewUrl[type]);
      setPreviewUrl((prev) => {
        const { [type]: _, ...rest } = prev;
        return rest;
      });
    }

    setForm((prev) => {
      if (!prev) return prev;
      const newDownloads = { ...prev.downloads };
      delete newDownloads[type];
      return { ...prev, downloads: newDownloads };
    });

    setUploadError((prev) => {
      const { [type]: _, ...rest } = prev;
      return rest;
    });

    setEnabledDownloads(prev => ({ ...prev, [type]: false }));
  };

  // ✅ Helper to get display title with fallback to default
  const getDisplayTitle = (type: "brochure" | "document", download: any) => {
    if (download?.title && download.title.trim()) {
      return download.title;
    }
    return DEFAULT_TITLES[type];
  };

  const downloadTypes = [
    {
      id: "brochure" as const,
      title: "Project Brochure",
      description: "PDF brochure with project details",
      icon: <FileText className="w-5 h-5 text-green-600" />,
    },
    {
      id: "document" as const,
      title: "Legal Documents",
      description: "RERA approval, floor plans, etc.",
      icon: <File className="w-5 h-5 text-green-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {downloadTypes.map((type) => {
        const isEnabled = enabledDownloads[type.id];
        const download = form.downloads[type.id];
        const existingFile = download?.existingFileId
          ? form.existingFiles[type.id]?.[0]
          : null;
        const pendingFile = download?.file;
        const displayFile = pendingFile || existingFile;
        
        // ✅ Get the display title (with default fallback)
        const displayTitle = getDisplayTitle(type.id, download);

        return (
          <div
            key={type.id}
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
                    {type.title}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      isEnabled
                        ? "bg-green-900/30 text-green-500"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {isEnabled ? (
                      <><Eye className="w-3 h-3" />Visible</>
                    ) : (
                      <><EyeOff className="w-3 h-3" />Hidden</>
                    )}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{type.description}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleDownloadEnabled(type.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  isEnabled ? "bg-green-700" : "bg-neutral-700"
                }`}
                aria-pressed={isEnabled}
                aria-label={`${isEnabled ? "Hide" : "Show"} ${type.title}`}
                title={`${isEnabled ? "Hide" : "Show"} on public site`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Error Message */}
            {uploadError[type.id] && (
              <div className="mb-4 flex gap-2 p-3 rounded-lg bg-red-900/20 border border-red-900/40 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                {uploadError[type.id]}
              </div>
            )}

            {isEnabled ? (
              <>
                {!displayFile ? (
                  <div className="border-2 border-dashed border-green-900/40 rounded-lg p-6 text-center hover:border-green-700/60 transition bg-black/30">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(type.id, e.target.files)}
                      className="hidden"
                      id={`upload-${type.id}`}
                    />
                    <label
                      htmlFor={`upload-${type.id}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-white">Upload PDF</p>
                      <p className="text-xs text-neutral-500">Max 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-black/40 rounded-lg border border-green-900/30">
                      <div className="w-16 h-16 rounded-lg bg-neutral-800 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-white truncate">
                          {pendingFile?.name || (displayFile as ProjectFile)?.file_name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {pendingFile ? formatFileSize(pendingFile.size) : ""}
                        </p>

                        <input
                          type="text"
                          value={displayTitle}
                          onChange={(e) => updateDownloadTitle(type.id, e.target.value)}
                          className="mt-2 w-full px-3 py-2 bg-black border border-green-900/40 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700 transition"
                          placeholder={`Enter ${type.title} title`}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Default: "{DEFAULT_TITLES[type.id]}"
                        </p>
                      </div>

                      <button
                        onClick={() => removeDownload(type.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {previewUrl[type.id] && (
                      <iframe
                        src={previewUrl[type.id]}
                        className="w-full h-64 border border-green-900/30 rounded-lg bg-black"
                        title="PDF Preview"
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800 mb-3">
                  <EyeOff className="w-8 h-8 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-400">
                  This download is hidden from the public site.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Toggle the switch above to enable and upload content.
                </p>
              </div>
            )}
          </div>
        );
      })}

      <div className="p-4 bg-green-900/20 border border-green-900/40 rounded-lg">
        <h5 className="text-white text-sm font-medium mb-2">Download Settings</h5>
        <ul className="text-sm text-neutral-400 space-y-1">
          <li>• Files stored securely in MySQL as BLOBs</li>
          <li>• PDFs download directly with proper headers</li>
          <li>• Titles editable anytime without re-uploading</li>
          <li>• Hidden downloads won't appear on public site</li>
          <li className="text-green-500">• Default titles: "Project Brochure" and "Project Document"</li>
        </ul>
      </div>
    </div>
  );
}