// components/site/ImageModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

export function ImageModal({ src, onClose }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!src) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    setTimeout(() => closeRef.current?.focus(), 100);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.addEventListener('keydown', handleTab);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        ref={closeRef}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 
                   focus:outline-none focus:ring-2 focus:ring-white rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close modal"
      >
        <X size={32} aria-hidden="true" />
      </button>

      <div
        className="relative w-full max-w-4xl h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt="Full view"
          fill
          className="object-contain"
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}