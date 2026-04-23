// app/(admin)/admin/projects/page.tsx - Add delete confirmation modal

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";

// ── Single source of truth for the table column template ──────────────────
// ID | Name | Date | Status | Published | Actions
const COLS = "lg:grid-cols-[64px_1fr_130px_110px_90px_72px]";
const HEADERS = ["ID", "Name", "Date", "Status", "Published", "Actions"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/projects?page=${page}&limit=${pageSize}`,
        {
          credentials: "include", // ✅ ADD THIS - sends auth_session cookie
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProjects(data.projects || []);
      setTotalProjects(data.total ?? data.projects?.length ?? 0);
    } catch (err) {
      console.error("fetchProjects error:", err); // ✅ Add logging
      setError(err instanceof Error ? err.message : "Unknown error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-6">
        <PageHeader totalProjects={null} />
        <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-6 shadow-2xl shadow-green-900/10">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-3/4 rounded bg-neutral-800" />
                <div className="h-3 w-1/2 rounded bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-6">
        <PageHeader totalProjects={null} />
        <div className="rounded-xl border border-red-900/30 bg-red-900/10 p-5 text-red-300">
          <p className="font-medium">Error loading projects</p>
          <p className="mt-1 text-sm text-red-400">{error}</p>
        </div>
        <button
          onClick={() => fetchProjects(currentPage)}
          className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-medium text-white transition hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">
      <PageHeader totalProjects={totalProjects} />

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-10 text-center shadow-2xl shadow-green-900/10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/20">
            <Plus className="h-8 w-8 text-green-700" />
          </div>
          <h3 className="text-lg font-semibold text-white">No projects yet</h3>
          <p className="mt-2 text-sm text-gray-400">
            Create your first project to get started
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-green-900/40 bg-neutral-900 shadow-2xl shadow-green-900/10">
          {/* Desktop table header — hidden below lg */}
          <div
            className={`hidden border-b border-green-900/40 bg-black/40 px-6 py-3 lg:grid ${COLS} gap-4`}
          >
            {HEADERS.map((h) => (
              <div
                key={h}
                className="text-xs font-semibold uppercase tracking-widest text-green-700"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-green-900/20">
            {projects.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                displayIndex={(currentPage - 1) * pageSize + index + 1}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalProjects={totalProjects}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── PageHeader ───────────────────────────────────────────────────────────────
function PageHeader({ totalProjects }: { totalProjects: number | null }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Projects</h1>
        <p className="mt-1 text-sm text-gray-400 sm:text-base">
          Manage all your property projects
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {totalProjects !== null && (
          <div className="rounded-xl border border-green-900/40 bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-lg shadow-green-900/10">
            Total:{" "}
            <span className="font-semibold text-green-600">
              {totalProjects}
            </span>
          </div>
        )}
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-900/20 transition hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>
    </div>
  );
}

// ── ProjectRow ───────────────────────────────────────────────────────────────
//
function ProjectRow({
  project,
  displayIndex,
}: {
  project: Project;
  displayIndex: number;
}) {
  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      className={`
        flex flex-col gap-2 px-4 py-4 transition hover:bg-green-900/10
        sm:grid sm:grid-cols-[64px_1fr] sm:gap-x-4 sm:gap-y-2 sm:px-5 sm:py-4
        lg:grid ${COLS} lg:items-center lg:gap-4 lg:px-6 lg:py-3.5
      `}
    >
      {/* ID */}
      <div className="min-w-0">
        <FieldLabel>ID</FieldLabel>
        <span className="font-mono text-sm text-gray-400">#{displayIndex}</span>
      </div>

      {/* Name */}
      <div className="min-w-0">
        <FieldLabel>Name</FieldLabel>
        <p className="truncate text-sm font-semibold text-white sm:text-base">
          {project.name}
        </p>
      </div>

      {/*
        Meta group — Date · Status · Published · Actions
        Mobile/tablet: flex row of chips + button spanning col 2
        Desktop: `lg:contents` dissolves the div so each child
                 slots into its own table column naturally
      */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:col-start-2 lg:contents">
        {/* Date */}
        <div className="min-w-0">
          <FieldLabel>Date</FieldLabel>
          <span className="whitespace-nowrap text-sm text-gray-300">
            {formattedDate}
          </span>
        </div>

        {/* Status */}
        <div className="min-w-0">
          <FieldLabel>Status</FieldLabel>
          <StatusBadge status={project.status} />
        </div>

        {/* Published */}
        <div className="min-w-0">
          <FieldLabel>Published</FieldLabel>
          <PublishedBadge published={project.is_published} />
        </div>

        {/* Actions */}
        <div className="min-w-0">
          <Link
            href={`/admin/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-green-700/40 bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-800/30 hover:text-green-300"
            title="Edit project"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  totalProjects,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalProjects: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalProjects);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-green-900/30 bg-black/40 px-4 py-4 sm:px-6">
      <p className="text-sm text-gray-400">
        Showing <span className="font-medium text-green-600">{from}</span>
        {" – "}
        <span className="font-medium text-green-600">{to}</span>
        {" of "}
        <span className="font-medium text-green-600">{totalProjects}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <PageArrowBtn
          label="Previous page"
          icon={<ChevronLeft className="h-4 w-4" />}
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        />

        <div className="flex items-center gap-1">
          {buildPageNums(currentPage, totalPages).map((entry, i) =>
            entry === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="select-none px-1 text-gray-500"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => onPageChange(entry as number)}
                className={`min-w-[32px] rounded px-2.5 py-1.5 text-sm transition ${
                  currentPage === entry
                    ? "bg-green-700 font-medium text-white"
                    : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {entry}
              </button>
            ),
          )}
        </div>

        <PageArrowBtn
          label="Next page"
          icon={<ChevronRight className="h-4 w-4" />}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        />
      </div>
    </div>
  );
}

// ── Atoms ────────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-0.5 text-xs text-gray-500 lg:hidden">{children}</p>;
}

function PageArrowBtn({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-900/40 bg-neutral-900 text-green-700 transition hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
    </button>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; cls: string }> = {
    ongoing: {
      label: "Ongoing",
      cls: "bg-blue-900/30   text-blue-400   border-blue-900/40",
    },
    sold: {
      label: "Sold",
      cls: "bg-neutral-800   text-gray-400   border-neutral-700",
    },
    upcoming: {
      label: "Upcoming",
      cls: "bg-purple-900/30 text-purple-400 border-purple-900/40",
    },
  };
  const { label, cls } = map[status] ?? map.sold;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        published
          ? "border-green-900/40 bg-green-900/30 text-green-500"
          : "border-neutral-700 bg-neutral-800 text-gray-400"
      }`}
    >
      {published ? "Yes" : "No"}
    </span>
  );
}

// ── Pagination util ──────────────────────────────────────────────────────────
function buildPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
