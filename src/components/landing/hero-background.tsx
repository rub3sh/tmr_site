'use client';

import dynamic from 'next/dynamic';

const DottedSurface = dynamic(
  () => import('@/components/ui/dotted-surface').then((mod) => mod.DottedSurface),
  { ssr: false }
);

export function HeroBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[#0b0b0b]" />

      <DottedSurface className="z-[2] opacity-95" />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-[3]">
        <div className="absolute inset-0 bg-black/32" />
      </div>
    </>
  );
}
