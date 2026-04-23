// components/NavbarProjectsDropdown.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";
import { getCachedProjects, setCachedProjects, markProjectsChanged } from "@/lib/navbarCache";

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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  async function fetchProjects() {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) return;
    
    isFetching.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/projects/navbar", {
        cache: 'no-store',
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Update cache
      setCachedProjects(data);
      
      if (isMounted.current) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }

  // Listen for project changes
  useEffect(() => {
    const handleProjectsChanged = () => {
      console.log("🔄 Projects changed, clearing cache");
      // Clear current projects to force refresh on next hover
      if (isMounted.current) {
        setProjects([]);
      }
    };

    window.addEventListener('projectsChanged', handleProjectsChanged);
    
    return () => {
      window.removeEventListener('projectsChanged', handleProjectsChanged);
    };
  }, []);

  // Load data when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Try to get from cache first
    const cached = getCachedProjects();
    
    if (cached && cached.length > 0) {
      console.log("📦 Using cached projects data");
      setProjects(cached);
      setLoading(false);
    } else {
      console.log("🌐 Cache miss or expired, fetching fresh data");
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = () => onClose();

  if (!isOpen) return null;

  if (loading) {
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
      {projects.map((project, index) => (
        <motion.div
          key={project.slug}
          initial={isMobile ? false : { opacity: 0, x: -10 }}
          animate={isMobile ? {} : { opacity: 1, x: 0 }}
          transition={isMobile ? {} : { delay: index * 0.05 }}
        >
          <Link
            href={`/projects/${project.slug}`}
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
            <span className="truncate">{project.name}</span>
          </Link>
        </motion.div>
      ))}
    </>
  );
}