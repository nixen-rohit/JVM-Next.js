// hooks/useNews.ts
import useSWR from 'swr';
import { useCallback, useEffect } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useNews(category?: string) {
  const url = category && category !== 'All' 
    ? `/api/news?category=${encodeURIComponent(category)}`
    : '/api/news';
    
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000,   // Auto refresh every 5 minutes
    revalidateOnFocus: false,
    fallbackData: { articles: [], total: 0 },
  });

  useEffect(() => {
    const handleNewsUpdate = () => {
      console.log('🔄 News updated, refreshing...');
      mutate();
    };
    
    window.addEventListener('news-updated', handleNewsUpdate);
    
    return () => {
      window.removeEventListener('news-updated', handleNewsUpdate);
    };
  }, [mutate]);

  return {
    articles: data?.articles || [],
    total: data?.total || 0,
    isLoading,
    error,
    refreshNews: mutate,
  };
}

export function useAdminNews(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/news?page=${page}&limit=${limit}`,
    fetcher,
    {
      dedupingInterval: 0,
      refreshInterval: 0,
    }
  );

  return {
    articles: data?.articles || [],
    total: data?.total || 0,
    isLoading,
    error,
    refreshArticles: mutate,
  };
}