// components/site/InfoSection.tsx
'use client';

import { DownloadButton } from './DownloadButton';

interface InfoSectionProps {
  title?: string;
  descriptions: string[];
  downloads: Array<{
    type: 'brochure' | 'document';
    title: string;
    file: { src: string; name: string; mime: string };
  }>;
  onDownload: (file: { src: string; name: string; mime: string }) => void;
}



 
export function InfoSection({ title, descriptions, downloads = [], onDownload }: InfoSectionProps) {
  // Filter only brochure and document downloads
  const activeDownloads = downloads.filter(
    (d) => d.type === 'brochure' || d.type === 'document'
  );
  
  const hasDownloads = activeDownloads.length > 0;

  // ✅ CASE 1: No downloads - Full width, centered content
  if (!hasDownloads) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {title && (
            <h2 className="text-3xl lg:text-5xl font-serif mb-6 leading-tight">
              {title}
            </h2>
          )}
          {descriptions.map((desc, idx) => (
            <p key={idx} className="text-gray-600 mb-4 text-base lg:text-lg">
              {desc}
            </p>
          ))}
        </div>
      </section>
    );
  }

  // ✅ CASE 2: Has downloads - Two column layout with card
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-start">
      {/* Left side - Description */}
      <div>
        {title && (
          <h2 className="text-3xl lg:text-5xl font-serif mb-4 leading-tight">
            {title}
          </h2>
        )}
        {descriptions.map((desc, idx) => (
          <p key={idx} className="text-gray-600 mb-4 text-base lg:text-lg">
            {desc}
          </p>
        ))}
      </div>

      {/* Right side - Details Card with Downloads */}
      <div className="bg-gray-50 border rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
        <h3 className="text-2xl font-serif">Project Details</h3>
        
        {activeDownloads.map((download) => (
          <div key={download.type} className="space-y-3">
            <h5 className="text-xl font-semibold text-teal-700">
              {download.title}
            </h5>
            <button
              onClick={() => onDownload?.(download.file)}
              className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Download {download.type === 'brochure' ? 'Brochure' : 'Document'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailsCard({ 
  brochure, 
  document, 
  onDownload 
}: { 
  brochure?: any; 
  document?: any; 
  onDownload: (f: any) => void;
}) {
  return (
    <div className="bg-gray-50 border rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="text-3xl font-serif ">Project Details</h3>

      {/* Brochure Section */}
      {brochure && (
        <>
         {document && <Divider />}
          <div className="space-y-3">
            <h5 className="text-xl font-semibold text-teal-700">
              Project Brochure
            </h5>
            <DownloadButton 
              label="Download Brochure" 
              onClick={() => onDownload(brochure.file)} 
            />
          </div>
          {document && <Divider />}
        </>
      )}

      {/* Document Section */}
      {document && (
        <div className="space-y-3">
          <h5 className="text-xl font-semibold text-teal-700">
            Project Documents
          </h5>
          <DownloadButton 
            label="Download Document" 
            onClick={() => onDownload(document.file)} 
          />
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-200 my-6" />;
}