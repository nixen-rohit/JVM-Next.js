// app/providers/SWRProvider.tsx
"use client";

import { SWRConfig } from 'swr';

// Default fetcher using fetch
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const adminConfig  = {
  revalidateOnFocus: false,        // Don't refeatch when tab gains focus
  revalidateOnReconnect: false,    // Don't refetch on network reconnect
  revalidateIfStale: false,        // Don't auto-refresh stale data
  dedupingInterval: 60000,         // Dedupe requests within 60 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  refreshInterval: 0,              // No auto-refresh
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  keepPreviousData: true,          // Keep old data while fetching new
  fetcher,                         // Use default fetcher
};

export function AdminSWRProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={adminConfig}>{children}</SWRConfig>;
}