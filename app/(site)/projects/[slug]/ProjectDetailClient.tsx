// app/(site)/projects/[slug]/ProjectDetailClient.tsx
"use client";

import { useState, useEffect } from "react";
import { ProjectDetailResponse } from "@/types/project";

// Import section components
import { ComingSoon } from "@/components/ComingSoon";
import { Hero } from "@/components/project/Hero";
import { InfoSection } from "@/components/project/InfoSection";
import { Stats } from "@/components/project/Stats";
import { Highlight } from "@/components/project/Highlight";
import { MediaSection } from "@/components/project/MediaSection";
import { UnitSection } from "@/components/project/UnitSection";
import { CollageSection } from "@/components/project/CollageSection";
import { LocationMap } from "@/components/project/LocationMap";
import { ImageModal } from "@/components/project/ImageModal";
import { MapModal } from "@/components/project/MapModal";
import { KeyFeatures } from "@/components/project/KeyFeatures";


export function ProjectDetailClient({
  initialData,
}: {
  initialData: ProjectDetailResponse;
}) {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [activeMap, setActiveMap] = useState<"paper" | "google" | null>(null);
  const { config, files, downloads, project } = initialData;


  // ✅ Check if project is upcoming
  const isUpcoming = project.status === 'upcoming';


  // Handle ESC key for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMedia(null);
        setActiveMap(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = activeMedia || activeMap ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMedia, activeMap]);

  // Download handler for PDF BLOBs
  const handleDownload = (file: {
    src: string;
    name: string;
    mime: string;
  }) => {
    const link = document.createElement("a");
    link.href = file.src;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


   // ✅ Show Coming Soon page for upcoming projects
  if (isUpcoming) {
    return (
      <ComingSoon
        projectName={project.name}
        estimatedLaunch={config.info?.firstDescription || "Coming soon"}
        description="We're working hard to bring you something amazing. Stay tuned for updates!"
      />
    );
  }
// Add this right before returning the component
console.log("🔍 KeyFeatures Debug:", {
  isEnabled: config.sections?.keyFeatures,
  keyFeatures: config.keyFeatures,
  heading: config.keyFeatures?.heading,
  paragraph: config.keyFeatures?.paragraph,
  features: config.keyFeatures?.features,
});
  
 // ✅ Regular project view for ongoing/sold projects
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Conditionally render sections based on config */}
      {config.sections.hero && files.hero?.[0] && (
        <Hero
          title={config.hero?.title || project.name}
          subtitle={config.hero?.subtitle}
          imageSrc={files.hero[0].src}
          status={project.status} // ✅ Pass the status
        />
      )}
      {config.sections.info && (
        <InfoSection
          title={config.info?.title}
          descriptions={
            [
              config.info?.firstDescription,
              config.info?.secondDescription,
            ].filter(Boolean) as string[]
          }
          downloads={downloads}
          onDownload={handleDownload}
        />
      )}
      
      {config.sections.keyFeatures && (
      <KeyFeatures
        heading={config.keyFeatures?.heading}
        paragraph={config.keyFeatures?.paragraph}
        features={config.keyFeatures?.features}
        isEnabled={config.sections.keyFeatures}
      />
    )}
      {config.sections.stats && config.stats && config.stats.length > 0 && (
        <Stats stats={config.stats} />
      )}
      {config.sections.highlight && files.highlight?.[0] && (
        <Highlight
          title={config.highlight?.title}
          paragraph={config.highlight?.paragraph}
          imageSrc={files.highlight[0].src}
        />
      )}

      {config.sections.media && files.media?.length > 0 && (
        <MediaSection images={files.media} onImageClick={setActiveMedia} />
      )}
      {config.sections.units && files.units?.length > 0 && (
        <UnitSection images={files.units} onImageClick={setActiveMedia} />
      )}
      {config.sections.collage && files.collage?.length > 0 && (
        <CollageSection
          images={files.collage}
          showMoreLimit={config.collage?.showMoreLimit || 6}
          layoutPattern={config.collage?.layoutPattern || "modulo-6"}
          onImageClick={setActiveMedia}
        />
      )}
      {/* In ProjectDetailClient.tsx */}
      {config.sections.location && (
        <LocationMap
          paperMap={files.location?.[0]?.src}
          googleMapUrl={config.location?.googleMapEmbedUrl}
          onImageClick={setActiveMedia} // ✅ This will open the image in modal
          onPaperClick={() => setActiveMap("paper")} // Optional
        />
      )}
      {/* Modals */}
      {activeMedia && (
        <ImageModal src={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
      {activeMap && (
        <MapModal
          type={activeMap}
          paperSrc={
            files.location?.find((f) =>
              f.file_name.toLowerCase().includes("paper"),
            )?.src
          }
          googleUrl={config.location?.googleMapEmbedUrl}
          onClose={() => setActiveMap(null)}
        />
      )}
    </div>
  );
}
