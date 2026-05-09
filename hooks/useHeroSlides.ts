// hooks/useHeroSlides.ts
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useHeroSlides() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/hero-slides',
    fetcher,
    {
      dedupingInterval: 300000,  // 5 minutes cache
      refreshInterval: 300000,    // Auto refresh every 5 minutes
      revalidateIfStale: true,
      fallbackData: { slides: [] },  // ✅ Add this
    }
  );

  return {
    slides: data?.slides || [],
    isLoading,
    error,
    refreshSlides: mutate,  // Manual refresh function
  };
}