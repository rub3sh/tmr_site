'use client';

import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export function NewsletterSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section id="newsletter" ref={ref} className="scroll-mt-24 border-t border-white/5 bg-[#050505] py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-xl text-center"
      >
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Join the TheMarketRevelation Newsletter
        </h2>
        <p className="mt-3 text-sm text-white/40">
          Subscribe to get our latest content by email.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            placeholder="Email Address"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[var(--accent-hover)]"
          >
            Subscribe
          </button>
        </form>

        <p className="mt-4 text-xs text-white/20">
          We won&apos;t send you spam. Unsubscribe at any time.
        </p>
      </motion.div>
    </section>
  );
}
