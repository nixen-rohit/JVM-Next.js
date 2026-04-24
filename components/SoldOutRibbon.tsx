// components/project/SoldOutRibbon.tsx

'use client';

interface SoldOutRibbonProps {
  text?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function SoldOutRibbon({ 
  text = "SOLD OUT", 
  position = "top-right" 
}: SoldOutRibbonProps) {
  
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  const ribbonStyles = {
    'top-left': 'after:border-t-[12px] after:border-l-[12px] after:border-t-white after:border-l-white',
    'top-right': 'after:border-t-[12px] after:border-r-[12px] after:border-t-white after:border-r-white',
    'bottom-left': 'after:border-b-[12px] after:border-l-[12px] after:border-b-white after:border-l-white',
    'bottom-right': 'after:border-b-[12px] after:border-r-[12px] after:border-b-white after:border-r-white',
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-20 overflow-hidden w-32 h-32 pointer-events-none`}>
      <div
        className={`
          absolute bg-red-600 text-white font-bold py-1 px-8 shadow-lg
          ${position === 'top-left' && '-rotate-45 -left-8 top-8'}
          ${position === 'top-right' && 'rotate-45 -right-8 top-8'}
          ${position === 'bottom-left' && 'rotate-45 -left-8 bottom-8'}
          ${position === 'bottom-right' && '-rotate-45 -right-8 bottom-8'}
        `}
      >
        {text}
      </div>
      <div className={`absolute inset-0 ${ribbonStyles[position]}`} />
    </div>
  );
}