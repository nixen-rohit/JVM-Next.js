"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Pencil, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAdminNews } from "@/hooks/useNews";

export default function AdminNewsPage() {
  const [page, setPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { articles, total, isLoading, refreshArticles } = useAdminNews(page);
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !currentStatus }),
        credentials: "include",
      });
      
      if (res.ok) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("news-updated"));
        }
        refreshArticles();
      }
    } catch (error) {
      console.error("Toggle publish failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">News Management</h1>
            <p className="text-gray-400 mt-1">Manage press releases and blog articles</p>
          </div>
          <Link
            href="/admin/news/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Article
          </Link>
        </div>

        {/* Articles Table */}
        <div className="bg-neutral-900 rounded-xl border border-green-900/40 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-green-900/40 bg-black/40">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-green-600">Image</th>
                <th className="text-left p-4 text-sm font-medium text-green-600">Title</th>
                <th className="text-left p-4 text-sm font-medium text-green-600">Category</th>
                <th className="text-left p-4 text-sm font-medium text-green-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-green-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-green-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-900/20">
              {articles.map((article: any) => {
                // ✅ Build image URL from blob endpoint
                const imageUrl = `/api/news-image/${article.id}?v=${article.version || 1}`;
                const hasImageError = imageErrors[article.id];
                
                return (
                  <tr key={article.id} className="hover:bg-green-900/10 transition">
                    <td className="p-4">
                      <div className="w-12 h-12 relative rounded overflow-hidden bg-neutral-800">
                        {!hasImageError ? (
                          <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [article.id]: true }));
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium line-clamp-2 max-w-xs">
                        {article.title}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.category === 'press_media' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {article.category === 'press_media' ? 'Press Media' : 'Blog'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(article.published_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(article.id, article.is_published)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          article.is_published
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-neutral-800 text-gray-400'
                        }`}
                      >
                        {article.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {article.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Link
                          href={`/admin/news/${article.id}`}
                          className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-green-900/40">
              <p className="text-sm text-gray-400">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-green-900/40 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-green-900/40 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}