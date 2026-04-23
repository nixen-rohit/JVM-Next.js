// app/(site)/projects/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

// ✅ Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function generateStaticParams() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/projects/slugs`);
    
    if (!res.ok) return [];
    const projects = await res.json();
    
    return projects.map((p: { slug: string }) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/projects/slugs/${slug}`;
    
    // ✅ No cache options needed - Next.js handles it
    const res = await fetch(url);
    
    if (!res.ok) notFound();
    
    const data = await res.json();
    
    return <ProjectDetailClient initialData={data} />;
    
  } catch (error) {
    console.error("❌ Page error:", error);
    notFound();
  }
}