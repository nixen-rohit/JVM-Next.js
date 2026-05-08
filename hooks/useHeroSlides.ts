// hooks/useHeroSlides.ts
import useSWR from "swr";
import { useCallback, useEffect } from "react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useHeroSlides() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/hero-slides",
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 300000, // 5 minutes (300,000 ms)
      refreshInterval: 300000, // Auto refresh every 5 minutes
      revalidateIfStale: true, // Revalidate after 5 minutes
      fallbackData: { slides: [] }, // Empty slides as fallback
    },
  );

  // Manual refresh function
  const refreshSlides = useCallback(() => {
    console.log("🔄 Manually refreshing hero slides...");
    mutate();
  }, [mutate]);

  // Listen for admin updates
  useEffect(() => {
    const handleAdminUpdate = () => {
      console.log("📢 Admin update detected, refreshing slides...");
      mutate();
    };

    window.addEventListener("hero-slides-updated", handleAdminUpdate);

    return () => {
      window.removeEventListener("hero-slides-updated", handleAdminUpdate);
    };
  }, [mutate]);

  return {
    slides: data?.slides || [],
    isLoading,
    error,
    refreshSlides,
    lastUpdated: data?.timestamp || null,
  };
}

// For single hero slide
export function useHeroSlide(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/hero-slides?id=${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 300000, // Auto refresh every 5 minutes
      revalidateIfStale: true,
    },
  );

  return {
    slide: data,
    isLoading,
    error,
    refreshSlide: mutate,
  };
}
