/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchContact = async () => {
      try {
        const res = await fetch(`/api/contacts/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setContact(data);
      } catch (err) {
        setError("Failed to load contact");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/contacts");
    } catch (err) {
      alert("Error deleting contact");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse rounded-2xl border border-green-900/40 bg-neutral-900 p-6 text-gray-400">
            Loading contact...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-900/30 bg-red-900/10 p-6 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-green-900/40 bg-neutral-900 p-6 text-gray-400">
            No contact found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Contact Details
            </h1>
            <p className="mt-1 text-sm text-gray-400 sm:text-base">
              View and manage submitted contact information
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/contacts")}
            className="w-full rounded-xl border border-green-700/40 bg-green-900/20 px-5 py-3 text-sm font-medium text-green-700 transition hover:bg-green-800/30 hover:text-green-300 sm:w-auto"
          >
            Back
          </button>
        </div>

        {/* Contact Card */}
        <div className="overflow-hidden rounded-2xl border border-green-900/40 bg-neutral-900 shadow-2xl shadow-green-900/10">
          <div className="border-b border-green-900/40 bg-black/40 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-green-700">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700/70">
                Name
              </p>
              <p className="wrap-break-word text-base font-medium text-white">
                {contact.name}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700/70">
                Email
              </p>
              <p className="break-all text-base text-gray-300">
                {contact.email}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700/70">
                Phone
              </p>
              <p className="text-base text-gray-300">
                {contact.phone || "Not provided"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700/70">
                Submitted At
              </p>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 rounded-lg border border-green-900/30 bg-black/40 px-4 py-3">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-sm font-medium text-white">
                    {new Date(contact.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-green-900/30 bg-black/40 px-4 py-3">
                  <span className="text-xs text-gray-500">Time</span>
                  <span className="text-sm font-medium text-green-700">
                    {new Date(contact.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700/70">
                Message
              </p>
              <div className="rounded-xl border border-green-900/30 bg-black/40 p-4">
                <p className="whitespace-pre-line wrap-break-word text-base leading-7 text-gray-300">
                  {contact.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-xl bg-red-700/80 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {deleting ? "Deleting..." : "Delete Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}
