"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage } from "@/lib/imageCompression";

interface NewsFormData {
  id: string;
  title: string;
  category: "press_media" | "blog";
  content: string;
  source: string;
  published_date: string;
  is_published: boolean;
  sort_order: number;
  version: number;
  has_image: boolean;
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<NewsFormData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch article");
      }
      
      const data = await res.json();
      setForm({
        id: data.id,
        title: data.title,
        category: data.category,
        content: data.content || "",
        source: data.source || "",
        published_date: data.published_date.split('T')[0],
        is_published: data.is_published === 1,
        sort_order: data.sort_order,
        version: data.version || 1,
        has_image: data.has_image || false,
      });
      
      // If article has an image, show preview
      if (data.has_image) {
        setImagePreview(`/api/news-image/${data.id}?v=${data.version || 1}`);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      alert("Failed to load article");
      router.push("/admin/news");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Max 2MB");
      return;
    }

    try {
      const compressed = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
      });
      setImageFile(compressed);
      const preview = URL.createObjectURL(compressed);
      setImagePreview(preview);
      setRemoveExistingImage(false);
    } catch (error) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setRemoveExistingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    
    setSaving(true);
    setSaveError(null);
    
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    if (form.content) formData.append("content", form.content);
    if (form.source) formData.append("source", form.source);
    formData.append("published_date", form.published_date);
    formData.append("is_published", String(form.is_published));
    formData.append("sort_order", String(form.sort_order));
    
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    if (removeExistingImage && !imageFile) {
      formData.append("remove_image", "true");
    }
    
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("news-updated"));
        }
        
        setTimeout(() => {
          router.push("/admin/news");
          router.refresh();
        }, 1500);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update article");
      }
    } catch (error) {
      console.error("Error updating article:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("news-updated"));
        }
        router.push("/admin/news");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete article");
      }
    } catch (error) {
      alert("Failed to delete article");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Article not found</p>
          <Link href="/admin/news" className="text-green-600 hover:underline mt-2 inline-block">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/news"
              className="p-2 text-gray-400 hover:text-white rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Article</h1>
              <p className="text-gray-400 mt-1">Update your press release or blog post</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-900/40 rounded-lg text-green-400">
            Article updated successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/40 rounded-lg text-red-400">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-green-900/40 rounded-lg p-6 text-center hover:border-green-700/60 transition bg-black/30">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-white">
                      {form.has_image ? "Replace Image" : "Click to upload image"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, WebP • Max 2MB • 1200x800 recommended
                    </p>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as "press_media" | "blog" })}
                className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="press_media">Press Media</option>
                <option value="blog">Blog</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Published Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.published_date}
                onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-700"
                required
              />
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Source (Optional)
            </label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="e.g., Gulf News"
              className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content (Optional)
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white resize-y"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first. Use to manually order articles.
            </p>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-green-900/40">
            <div>
              <p className="text-white font-medium">Publish to Site</p>
              <p className="text-sm text-gray-400">Article will be visible on the public website</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_published: !form.is_published })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                form.is_published ? "bg-green-700" : "bg-neutral-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                form.is_published ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          
          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/news"
              className="px-6 py-2 border border-green-900/40 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-900 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
            >
              <div className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-red-900/40 bg-red-900/20">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Delete Article
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  Are you sure you want to delete "{form.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-neutral-800 bg-neutral-900/50 px-6 py-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </button>

                
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}