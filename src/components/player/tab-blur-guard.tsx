'use client';

import { useEffect, useState } from 'react';

export function TabBlurGuard({ children }: { children: React.ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="relative">
      {children}
      {isHidden && (
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <svg className="w-12 h-12 text-accent mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-white/40 text-sm">Return to this tab to continue watching</p>
          </div>
        </div>
      )}
    </div>
  );
}
