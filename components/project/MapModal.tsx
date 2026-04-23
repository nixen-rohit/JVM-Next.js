// components/site/MapModal.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface MapModalProps {
  type: 'paper' | 'google';
  paperSrc?: string;
  googleUrl?: string;
  onClose: () => void;
}

export function MapModal({ type, paperSrc, googleUrl, onClose }: MapModalProps) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (type === 'paper' && paperSrc) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 
                     focus:outline-none focus:ring-2 focus:ring-white rounded-full z-10"
          aria-label="Close map"
        >
          <X size={32} />
        </button>
        
        <div 
          className="relative w-full max-w-5xl h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={paperSrc}
            alt="Full site map"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  if (type === 'google' && googleUrl) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 
                     focus:outline-none focus:ring-2 focus:ring-white rounded-full z-10"
          aria-label="Close map"
        >
          <X size={32} />
        </button>
        
        <div 
          className="w-full max-w-5xl h-[80vh] bg-white rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={googleUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return null;
}