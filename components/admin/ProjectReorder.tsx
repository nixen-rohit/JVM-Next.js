"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Save, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface ProjectReorderProps {
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectReorder({ onClose, onSaved }: ProjectReorderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects/reorder", {
        credentials: "include",
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setProjects(updatedItems);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projects: projects.map((p, index) => ({
            id: p.id,
            sort_order: index,
          })),
        }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save order");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-green-900/40 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-900/40 p-4">
          <h2 className="text-xl font-semibold text-white">Reorder Projects</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-sm text-gray-400">
            Drag and drop projects to change their order in the navbar dropdown.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-96 overflow-y-auto"
                >
                  {projects.map((project, index) => (
                    <Draggable
                      key={project.id}
                      draggableId={project.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 rounded-lg border border-green-900/40 bg-black p-3"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab text-gray-400 hover:text-white"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {index + 1}.
                          </span>
                          <span className="flex-1 text-white">{project.name}</span>
                          <span className="text-xs text-gray-500">
                            {project.slug}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-end gap-3 border-t border-green-900/40 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-green-900/40 bg-neutral-900 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}