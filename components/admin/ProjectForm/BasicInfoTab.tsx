"use client";

import { ProjectFormState, ProjectStatus } from "@/types/project";

interface Props {
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState | null>>;
}

type ProjectField = keyof ProjectFormState["project"];

export function BasicInfoTab({ form, setForm }: Props) {
  const updateProject = (
    field: ProjectField,
    value: ProjectFormState["project"][ProjectField],
  ) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            project: { ...prev.project, [field]: value },
          }
        : prev,
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Project Name *
        </label>
        <input
          type="text"
          value={form.project.name}
          onChange={(e) => updateProject("name", e.target.value)}
          className="w-full px-4 py-2 bg-black border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition"
          placeholder="e.g., Green Valley Residences"
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          The public-facing name of your project
        </p>
      </div>

      {/* URL slugs */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          URL slugs *
        </label>
        <input
          type="text"
          value={form.project.slug}
          onChange={(e) =>
            updateProject(
              "slug",
              e.target.value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 80),
            )
          }
          className="w-full px-4 py-2 bg-black border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition"
          placeholder="green-valley-residences"
          pattern="^[a-z0-9-]+$"
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          Public URL:{" "}
          <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-white">
            /projects/{form.project.slug || "your slug"}
          </code>
        </p>
      </div>

    {/* Status + Publish Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Project Status
          </label>
          <select
            value={form.project.status}
            onChange={(e) =>
              updateProject("status", e.target.value as ProjectStatus)
            }
            className="w-full px-4 py-2 bg-black border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="sold">Sold Out</option>
          </select>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-between sm:justify-end sm:pt-6">
          <div className="text-right sm:text-left">
            <p className="text-sm font-medium text-white">Publish to Site</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Make visible on public website
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateProject("is_published", !form.project.is_published)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              form.project.is_published ? "bg-white" : "bg-neutral-700"
            }`}
            aria-pressed={form.project.is_published}
          >
            {/* FIX #7: was bg-black (invisible on white track), now bg-neutral-900 for contrast */}
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-neutral-900 transition ${
                form.project.is_published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      
    </div>
    </div>
  );
}
