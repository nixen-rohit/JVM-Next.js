// components/site/LocationMap.tsx

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LocationMapProps {
  paperMap?: string;
  googleMapUrl?: string;
  onPaperClick?: () => void;
  onGoogleClick?: () => void;
  onImageClick: (src: string) => void;
}

// Helper function to extract embed URL from various input formats
function extractEmbedUrl(input: string): string | null {
  if (!input) return null;
  
  // Case 1: If it's already a clean embed URL
  if (input.includes('google.com/maps/embed') && !input.includes('<iframe')) {
    return input;
  }
  
  // Case 2: Extract src from iframe code
  const iframeSrcMatch = input.match(/src="([^"]+)"/);
  if (iframeSrcMatch) {
    return iframeSrcMatch[1];
  }
  
  // Case 3: Extract src with single quotes
  const iframeSrcMatchSingle = input.match(/src='([^']+)'/);
  if (iframeSrcMatchSingle) {
    return iframeSrcMatchSingle[1];
  }
  
  // Case 4: If it's a share URL (maps.app.goo.gl), show warning
  if (input.includes('maps.app.goo.gl')) {
    console.warn('Share URL detected. Please use embed URL or iframe code instead.');
    return null;
  }
  
  return null;
}

export function LocationMap({ 
  paperMap, 
  googleMapUrl, 
  onPaperClick, 
  onGoogleClick,
  onImageClick
}: LocationMapProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (googleMapUrl) {
      const extractedUrl = extractEmbedUrl(googleMapUrl);
      
      if (extractedUrl) {
        setEmbedUrl(extractedUrl);
        setError('');
      } else {
        setEmbedUrl('');
        if (googleMapUrl.includes('maps.app.goo.gl')) {
          setError('Please use the "Embed a map" option from Google Maps, not the share link.');
        } else {
          setError('Invalid Google Maps URL. Please paste the entire embed code or embed URL.');
        }
      }
    }
  }, [googleMapUrl]);

  if (!paperMap && !googleMapUrl) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white">
      <div className="max-w-6xl mx-auto space-y-14">
        <h1 className="text-center text-3xl sm:text-4xl font-serif tracking-tight text-gray-900">
          Location Map
        </h1>

        {/* Error message for invalid URL */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>⚠️ Note:</strong> {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-10">
          {/* Paper Map - LEFT SIDE */}
          {paperMap && (
            <div className="group relative rounded-3xl p-px bg-linear-to-br from-indigo-200/40 to-transparent">
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Paper Map of Site
                </h2>
                <div 
                  className="w-full aspect-video relative rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => onImageClick(paperMap)}
                >
                  <Image
                    src={paperMap}
                    alt="Paper map of site location"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Click to enlarge
                </p>
              </div>
            </div>
          )}

          {/* Google Map - RIGHT SIDE */}
          {googleMapUrl && embedUrl && (
            <div className="group relative rounded-3xl p-px bg-linear-to-br from-indigo-200/40 to-transparent">
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Google Maps
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white shadow-sm">
                    Live
                  </span>
                </div>
                <div className="w-full aspect-video rounded-2xl overflow-hidden relative">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title="Google Map Location"
                  />
                  
                  <div className="absolute inset-0 bg-linear-to-t from-indigo-900/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Show message if only one map is available */}
        {paperMap && !googleMapUrl && (
          <div className="text-center text-gray-500 text-sm mt-4 p-4 bg-gray-50 rounded-lg">
            <p> Paper map available. Google map will be available soon.</p>
          </div>
        )}
        
        {!paperMap && googleMapUrl && (
          <div className="text-center text-gray-500 text-sm mt-4 p-4 bg-gray-50 rounded-lg">
            <p>Interactive Google map available. Paper map will be available soon.</p>
          </div>
        )}

        {/* Show both are available */}
        {paperMap && googleMapUrl && (
          <div className="text-center text-gray-400 text-xs mt-4">
            <p>Click paper map to enlarge | Interactive map with full-screen option</p>
          </div>
        )}
      </div>
    </section>
  );
}