// app/(site)/projects/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

// ✅ Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // In production, use relative URL or environment variable
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}

// ✅ Generate static paths at build time
export async function generateStaticParams() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/projects/slugs`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const projects = await res.json();
    
    // Return only published projects for static generation
    return projects.map((p: { slug: string }) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

// ✅ Metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/projects/slugs/${slug}`);
    
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

// ✅ Main page component
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/projects/slugs/${slug}`;
    
    // ✅ ISR caching - revalidate every 60 seconds
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate in background every 60 seconds
    });
    
    if (!res.ok) notFound();
    
    const data = await res.json();
    
    return <ProjectDetailClient initialData={data} />;
  } catch (error) {
    console.error("❌ Page error:", error);
    notFound();
  }
}