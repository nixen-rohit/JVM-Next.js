// components/NavbarProjectsDropdown.tsx

"use client";

import Link from "next/link";
import { FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavbarProjects } from "@/hooks/useProjects";

interface NavbarProjectsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export default function NavbarProjectsDropdown({
  isOpen,
  onClose,
  isMobile = false,
}: NavbarProjectsDropdownProps) {
  // ✅ Use SWR for automatic caching
  const { projects, isLoading, error } = useNavbarProjects();

  const handleClick = () => onClose();

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className={`${isMobile ? "pl-4 space-y-1" : "py-2"} px-4`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`animate-pulse ${isMobile ? "py-2" : "py-3"}`}>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-sm text-red-500 text-center">
        Failed to load projects
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 text-center">
        No projects available
      </div>
    );
  }

  return (
    <>
      {projects.map((project: any, index: number) => (
        <motion.div
          key={project.slug}
          initial={isMobile ? false : { opacity: 0, x: -10 }}
          animate={isMobile ? {} : { opacity: 1, x: 0 }}
          transition={isMobile ? {} : { delay: index * 0.05 }}
        >
          <Link
            href={`/projects/${project.slug}`}
            prefetch={true}  // ✅ Prefetch on hover
            className={`flex items-center ${
              isMobile ? "space-x-3 py-2.5 px-3 text-sm" : "space-x-3 px-4 py-3"
            } hover:bg-amber-50 transition-colors ${
              isMobile ? "text-gray-600 hover:text-amber-700" : "text-gray-700"
            }`}
            onClick={handleClick}
          >
            <FiMapPin
              className={isMobile ? "text-amber-600" : "text-black text-sm"}
            />
            <span className="truncate font-bold ">{project.name}</span>
          </Link>
        </motion.div>
      ))}
    </>
  );
}