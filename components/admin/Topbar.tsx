"use client";

import { BsSearch, BsBell, BsPerson } from "react-icons/bs";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search projects, users, contacts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <BsBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-black" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-900/30">
            <BsPerson className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
