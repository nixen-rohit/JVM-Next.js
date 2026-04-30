import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { BsBuilding, BsChatLeftText, BsPlus, BsDownload } from "react-icons/bs";
import { TbSlideshow } from "react-icons/tb";

// Add this interface
interface DashboardProps {
  totalProjects: number;
  totalContacts: number;
  totalSlides: number;
}

// Function to fetch projects count
async function getTotalProjects(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // ✅ Fix: Await cookies() and then get the cookie string
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/admin/projects?page=1&limit=1`, {
      cache: "no-store",
      headers: cookieString
        ? {
            Cookie: cookieString,
          }
        : {},
    });

    if (!res.ok) {
      console.error("Failed to fetch projects count");
      return 0;
    }

    const data = await res.json();
    return data.total || data.projects?.length || 0;
  } catch (error) {
    console.error("Error fetching projects count:", error);
    return 0;
  }
}

// Function of fetch contacts count
async function getTotalContacts(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // ✅ Fix: Await cookies() and then get the cookie string
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/contacts?page=1&limit=1`, {
      cache: "no-store",
      headers: cookieString
        ? {
            Cookie: cookieString,
          }
        : {},
    });

    if (!res.ok) {
      console.error("Failed to fetch contacts count");
      return 0;
    }

    const data = await res.json();
    return data.total || data.contacts?.length || 0;
  } catch (error) {
    console.error("Error fetching contacts count:", error);
    return 0;
  }
}

// Function of fetch slides count
async function getTotalSlides(): Promise<number> {
  try {
     const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const res = await fetch(`${baseUrl}/api/hero-slides?all=true`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch slides count");
      return 0;
    }

    const data = await res.json();
    // Return count of real slides (excluding fallback)
    const slides = data.slides || [];
    return slides.filter((s: any) => s.id !== "fallback-no-projects").length;
  } catch (error) {
    console.error("Error fetching slides count:", error);
    return 0;
  }
}

export default async function AdminDashboardPage() {
  // ✅ Check auth
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Update the stats array (replace the existing one)
  const [totalProjects, totalContacts, totalSlides] = await Promise.all([
    getTotalProjects(),
    getTotalContacts(),
    getTotalSlides(),
  ]);

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: BsBuilding,
      link: "/admin/projects",
    },
    {
      title: "Contact Requests",
      value: totalContacts.toString(),
      icon: BsChatLeftText,
      link: "/admin/contacts",
    },
    {
      title: "Hero Slides",
      value: totalSlides.toString(),
      icon: TbSlideshow,
      link: "/admin/hero-slides",
    },
  ];

  return (
    <div className="min-h-screen bg-black p-6 lg:p-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white  ">
            ADMIN DASHBOARD <span className="text-emerald-500">.</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">
            System Online. Welcome back
          </p>
        </div>

        <Link
          href="/admin/projects"
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-green-900/30"
        >
          {/* Subtle button glare effect */}
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
              {/* Green Glow Accent on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/20 to-transparent blur-sm" />
              </div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold text-white mt-3 tabular-nums">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black border border-zinc-800 group-hover:border-emerald-500/50 transition-all shadow-inner">
                  <Icon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Bottom "Progress" Bar Decorative element */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
