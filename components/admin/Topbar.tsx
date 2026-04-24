"use client";

import { BsPerson } from "react-icons/bs";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 w-full bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between h-17 p-8">
        
        {/* Left side (Logo / Title placeholder) */}
        <div className="flex items-center">
          <h1 className="text-white text-lg sm:text-xl font-semibold">
            Admin Pannel
          </h1>
        </div>

        {/* Right side (User section) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* User Info (hidden on very small screens) */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-900/30">
            <BsPerson className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}