//app/admin/news/new/page.tsx

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Eye, EyeOff } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

export default function NewNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "press_media",
    content: "",
    source: "",
    published_date: new Date().toISOString().split("T")[0],
    is_published: true,
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  console.log('📸 File selected:', file?.name, file?.type, file?.size);
  
  if (!file) {
    console.log('⚠️ No file selected');
    return;
  }

  // Validate image
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Image too large. Max 2MB");
    return;
  }

  // ✅ First, set the original file immediately
  setImageFile(file);
  const preview = URL.createObjectURL(file);
  setImagePreview(preview);
  
  // ✅ Then try to compress in background (don't wait for it)
  try {
    const compressed = await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
    });
    console.log('📸 Image compressed:', compressed.name, compressed.type, compressed.size);
    // Update with compressed version
    setImageFile(compressed);
    // Update preview with compressed version
    const newPreview = URL.createObjectURL(compressed);
    setImagePreview(newPreview);
    // Clean up old preview
    URL.revokeObjectURL(preview);
  } catch (error) {
    console.error('Compression error, using original:', error);
    // Keep using original file (already set)
 
 
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }
};

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("category", form.category);
  if (form.content) formData.append("content", form.content);
  if (form.source) formData.append("source", form.source);
  formData.append("published_date", form.published_date);
  formData.append("is_published", String(form.is_published));
  
  // ✅ CRITICAL FIX: Check if imageFile exists and append correctly
  if (imageFile) {
    console.log('📸 Appending image:', imageFile.name, imageFile.type, imageFile.size);
    formData.append("image", imageFile);
  } else {
    console.log('⚠️ No image file to append - imageFile is null or undefined');
    // Log the state of imageFile
    console.log('imageFile state:', imageFile);
  }
  
  // ✅ Debug: Log all FormData entries
  console.log('📤 FormData entries:');
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
  }

  try {
    const res = await fetch("/api/admin/news", {
      method: "POST",
      body: formData, // ✅ Don't set Content-Type header - let browser set it with boundary
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
      alert(error.error || "Failed to create article");
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("Failed to create article");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/news"
            className="p-2 text-gray-400 hover:text-white rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Create New Article
            </h1>
            <p className="text-gray-400 mt-1">
              Add a new press release or blog post
            </p>
          </div>
        </div>

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
                      Click to upload image
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
              Title *
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
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="press_media">Press Media</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Published Date *
              </label>
              <input
                type="date"
                value={form.published_date}
                onChange={(e) =>
                  setForm({ ...form, published_date: e.target.value })
                }
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
              rows={10}
              className="w-full px-4 py-2 bg-neutral-900 border border-green-900/40 rounded-lg text-white resize-y"
            />
          </div>

          
          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Publish immediately</p>
              <p className="text-sm text-gray-400">
                Article will be visible on the website
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, is_published: !form.is_published })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                form.is_published ? "bg-green-700" : "bg-neutral-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  form.is_published ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/news"
              className="px-6 py-2 border border-green-900/40 rounded-lg text-gray-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Creating..." : "Create Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
