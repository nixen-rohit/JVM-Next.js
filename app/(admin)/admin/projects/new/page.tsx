// app/(admin)/admin/projects/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { markProjectsChanged } from "@/lib/navbarCache"; // ✅ Add this import


type FormState = {
  name: string;
  // slug is auto-generated, not user-edited
  status: "upcoming" | "ongoing" | "sold";
  is_published: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// ✅ slug generator utility
function generateslug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    .slice(0, 80); // Max length for SEO
}

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    status: "upcoming",
    is_published: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ✅ Auto-generated slug (read-only preview)
  const autoslug = generateslug(form.name);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, name }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Validate auto-generated slug
    if (!autoslug || autoslug.length < 3) {
      newErrors.name =
        "Name must generate a valid URL (3+ chars, letters/numbers)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("📤 [NEW] Submitting form:", {
      name: form.name,
      slug: autoslug,
      status: form.status,
      is_published: form.is_published,
    });

    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: autoslug, // ✅ Send auto-generated slug
        }),
        credentials: "include",
      });

      const data = await res.json();

      console.log("📥 [NEW] Response status:", res.status);

      if (!res.ok) {
        if (res.status === 409) {
          // slug conflict: auto-append timestamp
          const uniqueslug = `${autoslug}-${Date.now().toString(36).slice(-4)}`;
          const retryRes = await fetch("/api/admin/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...form,
              slug: uniqueslug,
            }),
            credentials: "include",
          });

          const retryData = await retryRes.json();
          if (!retryRes.ok) {
            setSubmitError(retryData.error || "Failed to create project");
            return;
          }          
          
          
          markProjectsChanged();

          setSuccess(true);
          setTimeout(
            () => router.push(`/admin/projects/${retryData.projectId}`),
            1500,
          );
          return;
        }

        if (res.status === 401) {
          setSubmitError("Session expired. Please log in again.");
        } else {
          setSubmitError(data.error || "Failed to create project");
        }
        return;
      }


       // ✅ Invalidate navbar cache when new project is created
      markProjectsChanged();

      setSuccess(true);
      setTimeout(() => {
        console.log(
          "🔄 [NEW] Redirecting to:",
          `/admin/projects/${data.projectId}`,
        );
        router.push(`/admin/projects/${data.projectId}`);
      }, 1500);
    } catch (err) {
      console.error("Create project error:", err);
      setSubmitError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-green-900/40 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-900/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Create New Project
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Set up a new property project
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-900/40 bg-black p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-700">
              Project created successfully!
            </p>
            <p className="text-sm text-green-600/80">
              Redirecting to editor...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 rounded-xl border border-red-900/30 bg-red-900/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-300">Failed to create project</p>
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          {/* Name Field */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-2"
            >
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g., Green Valley Residences"
              className={`w-full rounded-lg border bg-black px-4 py-3 text-white border-green-900/40 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition ${
                errors.name ? "border-red-500" : "border-neutral-800"
              }`}
              disabled={submitting || success}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              The public-facing name of your project
            </p>
          </div>

          {/* ✅ Auto-slug Preview (Read-Only) */}
          {form.name.length >= 3 && (
            <div className="mb-6 p-4 rounded-lg bg-black border border-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-white">
                  Auto-Generated URL
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-neutral-500">/projects/</span>
                <span className="text-white">
                  {autoslug || "your-slug-here"}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                URL is auto-generated from the name. Lowercase, hyphens, no
                special characters.
              </p>
            </div>
          )}

          {/* Status Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Project Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  value: "upcoming",
                  label: "Upcoming",
                  desc: "Pre-launch phase",
                },
                { value: "ongoing", label: "Ongoing", desc: "Active sales" },
                { value: "sold", label: "Sold Out", desc: "All units sold" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer flex-col rounded-lg border p-4 transition ${
                    form.status === option.value
                      ? "border-white bg-white/5"
                      : "border-neutral-800 bg-black hover:border-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={form.status === option.value}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as FormState["status"],
                      }))
                    }
                    className="sr-only"
                    disabled={submitting || success}
                  />
                  <span className="text-sm font-medium text-white">
                    {option.label}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1">
                    {option.desc}
                  </span>
                  {form.status === option.value && (
                    <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-white" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between py-4 border-t border-neutral-800">
            <div>
              <p className="text-sm font-medium text-white">Publish to Site</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Make this project visible on the public website
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  is_published: !prev.is_published,
                }))
              }
              disabled={submitting || success}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                form.is_published ? "bg-white" : "bg-neutral-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition ${
                  form.is_published
                    ? "translate-x-6 bg-black"
                    : "translate-x-1 bg-neutral-300"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting || success}
            className="inline-flex justify-center rounded-lg border border-neutral-800 bg-transparent px-6 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || success || !autoslug}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Created!
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>

      {/* Helper Tips */}
      <div className="mt-8 rounded-xl border border-green-900/40 bg-black p-4">
        <h4 className="text-sm font-medium text-green-700 mb-2">
          💡 How slugs Work
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>
            • URL is auto-generated:{" "}
            <code className="bg-neutral-800 px-1 rounded">
              /projects/{autoslug || "your-slug"}
            </code>
          </li>
          <li>• Only lowercase letters, numbers, and hyphens are used</li>
          <li>
            • If a slug conflicts, we auto-add a short code to keep it unique
          </li>
          <li>• You can edit the slug later in project settings if needed</li>
        </ul>
      </div>
    </div>
  );
}
