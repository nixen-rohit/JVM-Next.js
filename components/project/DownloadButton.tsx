// components/site/DownloadButton.tsx
'use client';

interface DownloadButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function DownloadButton({ label, onClick, className = '' }: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${className}`}
    >
      {label}
    </button>
  );
}