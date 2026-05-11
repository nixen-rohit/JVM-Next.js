// hooks/useProjects.ts - Clean version
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useNavbarProjects() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/navbar",
    fetcher,
    {
      dedupingInterval: 300000,  // 5 minutes cache (same as hero slides)
      refreshInterval: 300000,    // Auto refresh every 5 minutes
      revalidateOnFocus: true, // ✅ Good for catching updates
      revalidateOnReconnect: true, // ✅ Good for coming back online
      fallbackData: [],
    },
  );

  return {
    projects: data || [],
    isLoading,
    error,
    refreshProjects: mutate,
  };
}

 