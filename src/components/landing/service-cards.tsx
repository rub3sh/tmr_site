'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Activity, GraduationCap, BookOpen } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const SERVICES = [
  {
    icon: GraduationCap,
    title: 'Mentorship',
    desc: 'The standard of trading education and guidance.',
    href: '/services/mentorship',
  },
  {
    icon: Activity,
    title: 'Indicator',
    desc: 'An automatic tool to spot high-probability setups.',
    href: '/services/indicators',
  },
  {
    icon: Building2,
    title: 'Prop Firms',
    desc: 'Discover our trusted Prop Firm partners.',
    href: '/services/prop-firms',
  },
  {
    icon: BookOpen,
    title: 'Education',
    desc: 'Trading concepts, strategies, techniques, and insights.',
    href: '/market-education',
  },
] as const;

export function ServiceCards() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="border-t border-white/5 bg-[#0a0a0a] py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/[0.06]">
                  <Icon className="h-6 w-6 text-[var(--accent)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {service.desc}
                </p>
                <Link
                  href={service.href}
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                >
                  Explore <span>&rarr;</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
