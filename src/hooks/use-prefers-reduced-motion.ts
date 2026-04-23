import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handlePreferenceChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handlePreferenceChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handlePreferenceChange);

      return () => {
        mediaQuery.removeEventListener('change', handlePreferenceChange);
      };
    }

    mediaQuery.addListener(handlePreferenceChange);

    return () => {
      mediaQuery.removeListener(handlePreferenceChange);
    };
  }, []);

  return prefersReducedMotion;
}