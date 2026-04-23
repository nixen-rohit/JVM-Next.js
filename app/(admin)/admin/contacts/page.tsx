/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));

  const fetchContacts = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/contacts?page=${page}&limit=${pageSize}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      setContacts(data.contacts || data.data || []);
      setTotalContacts(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to load contacts. Please try again.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="mb-6 text-3xl font-bold text-green-700">
          Contact Requests
        </h1>
        <div className="animate-pulse rounded-xl border border-green-900/40 bg-neutral-900 p-6 text-gray-400">
          Loading contact requests...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="mb-6 text-3xl font-bold text-green-700">
          Contact Requests
        </h1>
        <div className="rounded-xl border border-red-900/30 bg-red-900/10 p-5 text-red-300">
          {error}
        </div>
        <button
          onClick={() => fetchContacts(currentPage)}
          className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-medium text-white transition hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full  bg-black p-4 text-white sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Contact Requests
          </h1>
          <p className="mt-1 text-sm text-gray-400 sm:text-base">
            Manage all user contact messages
          </p>
        </div>

        <div className="w-full rounded-xl border border-green-900/40 bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg shadow-green-900/10 sm:w-fit">
          Total Requests:{" "}
          <span className="font-semibold text-green-700">{totalContacts}</span>
        </div>
      </div>

      {/* Empty State */}
      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-6 text-center text-gray-400 sm:p-10">
          No contact requests found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-green-900/40 bg-neutral-900 shadow-2xl shadow-green-900/10">
          {/* Desktop Header — matches row grid exactly */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_1.5fr_1fr_1fr_100px] gap-4 border-b border-green-900/40 bg-black/40 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-green-700">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {/* Contact Rows */}
          <div className="divide-y divide-green-900/20">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-1 gap-y-2 gap-x-4 px-4 py-5 transition hover:bg-green-900/10 sm:grid-cols-2 sm:px-5 lg:grid-cols-[1fr_1.5fr_1fr_1fr_100px] lg:items-center lg:gap-4 xl:px-6"
              >
                {/* Name */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 lg:hidden">Name</p>
                  <p className="truncate text-sm font-semibold text-white sm:text-base">
                    {c.name}
                  </p>
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 lg:hidden">Email</p>
                  <p className="truncate text-sm text-gray-300 sm:text-base">
                    {c.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 lg:hidden">Phone</p>
                  <p className="text-sm text-gray-300 sm:text-base">
                    {c.phone || "N/A"}
                  </p>
                </div>

                {/* Date */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 lg:hidden">Date</p>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <button
                    onClick={() =>
                      (window.location.href = `/admin/contacts/${c.id}`)
                    }
                    className="w-full rounded-lg border border-green-700/40 bg-green-900/20 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-800/30 hover:text-green-300 lg:w-auto"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-green-900/30 bg-black/40 px-4 py-4 sm:flex-row sm:px-6">
              <p className="text-center text-sm text-gray-400 sm:text-left">
                Page{" "}
                <span className="font-medium text-green-700">{currentPage}</span>{" "}
                of{" "}
                <span className="font-medium text-green-700">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center rounded-lg border border-green-900/40 bg-neutral-900 p-2.5 text-green-700 transition hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center rounded-lg border border-green-900/40 bg-neutral-900 p-2.5 text-green-700 transition hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}