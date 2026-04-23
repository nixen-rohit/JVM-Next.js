"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BsGrid,
  BsKanban,
  BsEnvelope,
 
  BsChevronLeft,
  BsChevronRight,
  BsGear,
  BsBoxArrowRight,
} from "react-icons/bs";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: BsGrid },
  { name: "Sliders", href: "/admin/hero-slides", icon: BsGrid },
  { name: "Projects", href: "/admin/projects", icon: BsKanban },
  { name: "Contacts", href: "/admin/contacts", icon: BsEnvelope },
  
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
  setLogoutLoading(true);
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");   
  } catch (error) {
    console.error("Logout failed", error);
  } finally {
    setLogoutLoading(false);
  }
};

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-black border-r border-gray-800 text-white min-h-screen flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo & Toggle */}
      <div className="p-5 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-linear-to-r text-green-700 bg-clip-text  ">
            EstateAdmin
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <BsChevronRight className="w-5 h-5" />
          ) : (
            <BsChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-green-700" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              {!collapsed && <span className="font-medium">{item.name}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-2 h-2 bg-green-700 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-800 space-y-3">
        {/* Settings Link */}
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <BsGear className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>

        {/* Logout Button - Original UI, Inline Logic */}
        <div className={`${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {logoutLoading ? (
              <span
                className={`text-sm ${collapsed ? "" : "flex items-center gap-2"}`}
              >
                {collapsed ? (
                  <span className="w-4 h-4 rounded-full animate-spin" />
                ) : (
                  <>
                    <BsBoxArrowRight className="w-4 h-4 animate-pulse" />
                    Logout
                  </>
                )}
              </span>
            ) : (
              <>
                <BsBoxArrowRight className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
