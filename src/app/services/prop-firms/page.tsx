'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';

const PROP_FIRMS = [
  {
    name: 'Lucid Trading',
    discount: '50% OFF',
    code: 'IEC',
    buyHref: '#',
  },
  {
    name: 'Apex Trader Funding',
    discount: '90% OFF',
    code: 'IEC',
    buyHref: '#',
  },
  {
    name: 'Tradeify',
    discount: '40% OFF',
    code: 'IEC',
    buyHref: '#',
  },
] as const;

export default function PropFirmsPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="px-6 pt-28 pb-12 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Floating icons */}
          <div className="mx-auto mb-8 flex items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, rotate: -12 }}
              animate={heroVisible ? { opacity: 1, rotate: -6 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#111] border border-white/5 shadow-lg"
            >
              <CheckCircle2 className="h-6 w-6 text-[var(--accent)]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={heroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#111] border border-white/5 shadow-lg"
            >
              <ExternalLink className="h-7 w-7 text-white/60" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, rotate: 12 }}
              animate={heroVisible ? { opacity: 1, rotate: 6 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#111] border border-white/5 shadow-lg"
            >
              <CheckCircle2 className="h-6 w-6 text-[var(--accent)]" />
            </motion.div>
          </div>

          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Trusted <span className="text-[var(--accent)]">Prop Firms</span>
          </h1>
          <p className="mt-4 text-base text-white/50 md:text-lg">
            Discover Our Trusted Prop Firm Partners Below
          </p>

          {/* Discount code badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-sm text-white/60">Use Code:</span>
            <span className="rounded bg-[#111] px-2 py-0.5 text-sm font-bold text-white">IEC</span>
            <span className="text-sm text-white/40">for best discount!</span>
          </div>
        </motion.div>
      </section>

      {/* Prop Firm Cards */}
      <section ref={cardsRef} className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {PROP_FIRMS.map((firm, i) => (
            <motion.div
              key={firm.name}
              initial={{ opacity: 0, y: 20 }}
              animate={cardsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-center"
            >
              {/* Icon placeholder */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#111] border border-white/5">
                <ExternalLink className="h-7 w-7 text-white/40" />
              </div>

              <h3 className="text-lg font-bold text-white">{firm.name}</h3>

              <p className="mt-4 text-4xl font-extrabold text-white">{firm.discount}</p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/40">
                <span>Use Code</span>
                <span className="rounded bg-white/5 px-2 py-0.5 font-mono font-bold text-white">{firm.code}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(firm.code)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Copy code"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <Link
                href={firm.buyHref}
                className="mt-6 block w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-black transition-all hover:bg-[var(--accent-hover)]"
              >
                Buy Now
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
