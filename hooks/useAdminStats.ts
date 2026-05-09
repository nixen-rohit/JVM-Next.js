// hooks/useAdminStats.ts
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useAdminStats() {
  // Fetch all stats with individual SWR hooks (automatically cached)
  const { data: projectsData, isLoading: projectsLoading } = useSWR(
    '/api/admin/projects?page=1&limit=1',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );
  
  const { data: contactsData, isLoading: contactsLoading } = useSWR(
    '/api/contacts?page=1&limit=1',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );
  
  const { data: slidesData, isLoading: slidesLoading } = useSWR(
    '/api/hero-slides?all=true',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 0,
      keepPreviousData: true,
    }
  );

  const totalProjects = projectsData?.total || projectsData?.projects?.length || 0;
  const totalContacts = contactsData?.total || contactsData?.contacts?.length || 0;
  const totalSlides = slidesData?.slides?.filter((s: any) => s.id !== "fallback-no-projects").length || 0;

  return {
    stats: {
      slides: totalSlides,
      projects: totalProjects,
      contacts: totalContacts,
    },
    loading: {
      slides: slidesLoading,
      projects: projectsLoading,
      contacts: contactsLoading,
    },
    refresh: {
      slides: () => {}, // You can add mutate functions if needed
      projects: () => {},
      contacts: () => {},
    }
  };
}