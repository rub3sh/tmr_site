'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-24 md:py-32">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            We Don&apos;t Copy Signals,
            <br />
            <span className="text-white/50">We Create Trends</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/35 md:text-base">
            A private ecosystem of mentors, models, and traders dedicated to developing
            real skill in the markets. No shortcuts, no signals — just systems that work.
          </p>
        </motion.div>

        {/* Floating avatar circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex items-center justify-center"
        >
          <div className="flex -space-x-3">
            {['ME', 'IE', 'JU', 'BR', 'MI', 'LE'].map((initials, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white/[0.06] text-[10px] font-bold text-white/25 md:h-12 md:w-12"
              >
                {initials}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-sm bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90"
          >
            Become Member <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
