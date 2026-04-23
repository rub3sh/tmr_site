'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Target, Eye, Shield } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Precision Over Noise',
    description: 'We teach mathematical structure, not guesswork. Every concept is grounded in repeatable logic.',
  },
  {
    icon: Eye,
    title: 'Clarity Over Complexity',
    description: 'Our methods strip away the noise so you see market structure with absolute clarity.',
  },
  {
    icon: Shield,
    title: 'Discipline Over Emotion',
    description: 'Trading is controlled probability. We build frameworks that remove emotional decision-making.',
  },
];

export default function AboutPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: missionRef, isVisible: missionVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="px-6 pt-28 pb-16 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Our Story
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            About InnerEdgeCapital
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/50 md:text-lg">
            Built by traders who believe the market has a mathematical structure — and that anyone
            with discipline can learn to see it.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section ref={missionRef} className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={missionVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl rounded-2xl border border-white/5 bg-[#0a0a0a] p-8 md:p-12"
        >
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">The Mission</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/50 md:text-base">
            <p>
              InnerEdgeCapital was founded on a single conviction: the market is not random. Behind every candle,
              every wick, every sweep — there is structure. Time cycles, price geometry, and institutional order
              flow create a framework that, once understood, gives you an unfair advantage.
            </p>
            <p>
              We are not here to sell signals or shortcuts. We are here to teach you how to see what
              the market is actually doing — and position yourself on the right side of probability.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={valuesVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center font-heading text-2xl font-bold text-white md:text-3xl"
          >
            Our Values
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={valuesVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-xl border border-white/5 bg-[#0a0a0a] p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                    <Icon className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/40">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
