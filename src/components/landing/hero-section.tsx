'use client';

import Link from 'next/link';
import { GraduationCap, Activity, Building2, BookOpen, Mail } from 'lucide-react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';

const HUB_ITEMS = [
  { id: 1, icon: GraduationCap, title: 'Mentorship', href: '/services/mentorship', angle: 288 },
  { id: 2, icon: BookOpen, title: 'Education\nCenter', href: '/market-education', angle: 0 },
  { id: 3, icon: Activity, title: 'Custom\nIndicator', href: '/services/indicators', angle: 72 },
  { id: 4, icon: Building2, title: 'Prop Firms', href: '/services/prop-firms', angle: 144 },
  { id: 5, icon: Mail, title: 'Newsletter', href: '/#newsletter', angle: 216 },
];

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-black px-6 pt-28 pb-0 md:pt-32">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.025),transparent_70%)]"
      />

      {/* ── CTA row ── */}
      <div className="mb-14 flex items-center gap-4">
        <Link
          href="/market-education"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10"
        >
          New Article
        </Link>
        <Link
          href="/market-education"
          className="group flex items-center gap-1 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
        >
          Check out the blog
          <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      </div>

      {/* ── Service Hub ── */}
      <div className="relative mb-16">
        <RadialOrbitalTimeline items={HUB_ITEMS} />
      </div>

      {/* ── Headline ── */}
      <div className="max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
          Master the Market with{' '}
          <span className="text-gradient-accent">TheMarketRevelation</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/40 md:text-base">
          Cut through the noise with a simple, repeatable trading system built around how the markets
          actually reverse. TheMarketRevelation&apos;s private trading system, now available to the world.
        </p>

        <div className="mt-8 pb-16">
          <Link
            href="/services/mentorship"
            className="inline-block rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_0_20px_var(--accent-glow)]"
          >
            Explore the Mentorship
          </Link>
        </div>
      </div>
    </section>
  );
}
