// app/(admin)/admin/page.tsx - UPDATED with SWR
"use client";

import useSWR from 'swr';
import Link from "next/link";
import { BsBuilding, BsChatLeftText, BsPlus } from "react-icons/bs";
import { TbSlideshow } from "react-icons/tb";

export default function AdminDashboardPage() {
  // Fetch all stats with SWR (automatically cached)
  const { data: projectsData, isLoading: projectsLoading } = useSWR(
    '/api/admin/projects?page=1&limit=1'
  );
  
  const { data: contactsData, isLoading: contactsLoading } = useSWR(
    '/api/contacts?page=1&limit=1'
  );
  
  const { data: slidesData, isLoading: slidesLoading } = useSWR(
    '/api/hero-slides?all=true'
  );

  const totalProjects = projectsData?.total || projectsData?.projects?.length || 0;
  const totalContacts = contactsData?.total || contactsData?.contacts?.length || 0;
  const totalSlides = slidesData?.slides?.filter((s: any) => s.id !== "fallback-no-projects").length || 0;

  const stats = [
    {
      title: "Hero Slides",
      value: totalSlides.toString(),
      icon: TbSlideshow,
      link: "/admin/hero-slides",
      loading: slidesLoading,
    },
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: BsBuilding,
      link: "/admin/projects",
      loading: projectsLoading,
    },
    {
      title: "Contact Requests",
      value: totalContacts.toString(),
      icon: BsChatLeftText,
      link: "/admin/contacts",
      loading: contactsLoading,
    },
  ];

  return (
    <div className="min-h-screen bg-black p-6 lg:p-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            ADMIN DASHBOARD <span className="text-emerald-500">.</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">
            System Online. Welcome back Admin
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
        >
          <BsPlus className="w-5 h-5 stroke-1" />
          NEW PROJECT
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.link}
              className="group relative bg-zinc-900/50 border border-zinc-800 p-6 transition-all hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/20 to-transparent blur-sm" />
              </div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    {stat.title}
                  </p>
                  {stat.loading ? (
                    <div className="mt-3">
                      <div className="w-16 h-8 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  ) : (
                    <p className="text-4xl font-bold text-white mt-3 tabular-nums">
                      {stat.value}
                    </p>
                  )}
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black border border-zinc-800 group-hover:border-emerald-500/50 transition-all shadow-inner">
                  <Icon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}