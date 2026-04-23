'use client';

import { motion } from 'framer-motion';
import { BentoPricing } from '@/components/ui/bento-pricing';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export function PricingSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <section id="pricing" ref={ref} className="border-t border-white/5 bg-[#070707] px-6 py-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-6xl"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Choose Your Trading Growth Plan
          </h2>
          <p className="mt-4 text-sm text-white/45 md:text-base">
            Start free, scale fast, and save more with quarterly or annual access. Quarterly is our Best Buy for active traders.
          </p>
        </div>

        <BentoPricing />
      </motion.div>
    </section>
  );
}
