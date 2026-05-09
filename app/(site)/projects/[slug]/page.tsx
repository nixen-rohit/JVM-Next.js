import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

// ❌ REMOVE ISR - no revalidation
// export const revalidate = 60;

function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}

// ❌ REMOVE static params generation (no ISR needed)
// export async function generateStaticParams() { ... }

// ✅ Metadata generation - dynamic, no cache
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/projects/slugs/${slug}`, {
      cache: 'no-store', // ✅ No cache for metadata
    });
    
    if (!res.ok) {
      return { title: 'Project Not Found' };
    }
    
    const data = await res.json();
    
    return {
      title: `${data.project?.name} | Your Site`,
      description: data.config?.info?.firstDescription?.slice(0, 160),
      openGraph: {
        title: data.project?.name,
        description: data.config?.info?.firstDescription?.slice(0, 160),
      },
    };
  } catch {
    return { title: 'Project Not Found' };
  }
}

// ✅ Main page component - dynamic, no cache
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/projects/slugs/${slug}`;
    
    // ❌ REMOVE ISR caching
    // Use no-store for fresh data every request
    const res = await fetch(url, {
      cache: 'no-store', // ✅ Always fetch fresh data
    });
    
    if (!res.ok) notFound();
    
    const data = await res.json();
    
    return <ProjectDetailClient initialData={data} />;
  } catch (error) {
    console.error("❌ Page error:", error);
    notFound();
  }
}