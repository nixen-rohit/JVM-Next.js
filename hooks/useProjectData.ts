// hooks/useProjectData.ts
import useSWR from 'swr';
import { useEffect } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useProjectData(slug: string, initialData?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `/api/projects/slugs/${slug}` : null,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes cache
      refreshInterval: 300000,   // Auto refresh every 5 minutes
      revalidateIfStale: true,
    }
  );

  // Listen for project updates from admin
  useEffect(() => {
    const handleProjectUpdate = () => {
      console.log('🔄 Project updated, refreshing data...');
      mutate();
    };
    
    window.addEventListener('project-updated', handleProjectUpdate);
    
    return () => {
      window.removeEventListener('project-updated', handleProjectUpdate);
    };
  }, [mutate]);

  return {
    project: data?.project,
    config: data?.config,
    files: data?.files,
    downloads: data?.downloads,
    isLoading,
    error,
    refreshData: mutate,
  };
}