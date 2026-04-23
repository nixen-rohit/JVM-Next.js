// app/(admin)/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth"; // ✅ Use shared auth util
import {
  BsBuilding,
  BsChatLeftText,
  BsPeople,
  BsGraphUp,
  BsArrowUpRight,
  BsArrowDownRight,
  BsPlus,
  BsDownload,
} from "react-icons/bs";

// ✅ Fixed: Use env var, not hardcoded secret
// (getCurrentUser already handles JWT verification internally)

// Optional: Fetch real stats from DB (uncomment when ready)
// import getPool from "@/lib/db";
// async function getDashboardStats() {
//   const pool = getPool();
//   if (!pool) return null;
//   const [projects] = await pool.query("SELECT COUNT(*) as count FROM projects");
//   const [contacts] = await pool.query("SELECT COUNT(*) as count FROM contacts");
//   const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
//   return { projects: projects[0].count, contacts: contacts[0].count, users: users[0].count };
// }

export default async function AdminDashboardPage() {
  // ✅ 1. Check auth using shared util (consistent with middleware)
  const user = await getCurrentUser();
  
  if (!user) {
    // ✅ 2. Redirect to admin login (not /login)
    redirect("/admin/login");
  }

  // Optional: Fetch real data
  // const statsData = await getDashboardStats();

  // Mock data (replace with DB fetch when ready)
  const stats = [
    {
      title: "Total Projects",
      value: "24", // statsData?.projects ?? "24"
      change: "+12%",
      trend: "up" as const,
      icon: BsBuilding,
      color: "from-blue-600 to-cyan-500",
      glow: "shadow-blue-900/40",
    },
    {
      title: "Contact Requests",
      value: "156", // statsData?.contacts ?? "156"
      change: "+24%",
      trend: "up" as const,
      icon: BsChatLeftText,
      color: "from-violet-600 to-purple-500",
      glow: "shadow-violet-900/40",
    },
    {
      title: "Active Users",
      value: "1,284", // statsData?.users ?? "1,284"
      change: "+8%",
      trend: "up" as const,
      icon: BsPeople,
      color: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-900/40",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Johnson",
      action: "submitted a contact request",
      target: "Luxury Villa #402",
      time: "2 min ago",
      avatar: "SJ",
    },
    {
      id: 2,
      user: "Mike Chen",
      action: "updated project",
      target: "Downtown Apartments",
      time: "15 min ago",
      avatar: "MC",
    },
    {
      id: 3,
      user: "Emma Wilson",
      action: "registered as new user",
      target: "",
      time: "1 hour ago",
      avatar: "EW",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {user.email}! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2">
            <BsDownload className="w-4 h-4" />
            Export
          </button>

          <button className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2">
            <BsPlus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === "up";

          return (
            <div
              key={stat.title}
              className="group bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl bg-linear-to-br ${stat.color} shadow-lg ${stat.glow}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`flex items-center text-sm font-medium ${
                    isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isUp ? (
                    <BsArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <BsArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </span>

                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
          </div>

          <div className="divide-y divide-gray-800">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-800/50 transition-colors flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm font-medium border border-gray-600">
                  {activity.avatar}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">
                      {activity.user}
                    </span>{" "}
                    <span className="text-gray-400">{activity.action}</span>{" "}
                    {activity.target && (
                      <span className="font-medium text-blue-400">
                        {activity.target}
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Performance</h2>

          <div className="space-y-4">
            {[
              { label: "Page Views", value: 78, color: "bg-blue-500" },
              { label: "Conversions", value: 45, color: "bg-emerald-500" },
              { label: "Bounce Rate", value: 32, color: "bg-violet-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>

                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This month</span>
              <span className="flex items-center text-emerald-400 font-medium">
                <BsGraphUp className="w-4 h-4 mr-1" />
                +18.5%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}