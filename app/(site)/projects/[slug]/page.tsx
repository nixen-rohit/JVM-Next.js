import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

// ✅ Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // ✅ Only fetch initial data for SEO, client will re-fetch with SWR
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.NEXT_PUBLIC_SITE_URL || '';
  
  try {
    const res = await fetch(`${baseUrl}/api/projects/slugs/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) notFound();
    
    const initialData = await res.json();
    
    // Pass initial data for SSR, SWR will handle updates
    return <ProjectDetailClient initialData={initialData} slug={slug} />;
  } catch (error) {
    console.error("❌ Page error:", error);
    notFound();
  }
}