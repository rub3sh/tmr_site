'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BentoPricing } from '@/components/ui/bento-pricing';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { ChevronRight, BarChart3 } from 'lucide-react';

const INDICATORS = [
  {
    name: 'Quantum Cycle Engine',
    description:
      'Built around QT Cycles and True Opens, this engine maps phase transitions and opening intent so you can align entries with the cleanest directional move.',
  },
  {
    name: 'Quantum Algo Clock',
    description:
      'A GB plus time plus alerts command center that keeps your execution synced to high-value market windows with automatic timing prompts.',
  },
  {
    name: 'Inducement Timing Model',
    description:
      'A cleaner macro-time framework that identifies inducement phases before displacement, helping you avoid early entries and improve confirmation timing.',
  },
  {
    name: 'Quantum SMT Engine',
    description:
      'Precision SMT detection across nano and micro structure, with smart alerts that flag divergence opportunities as they form in real time.',
  },
  {
    name: 'Quantum Imbalance Finder',
    description:
      'A branded imbalance scanner that highlights clean inefficiency zones and reaction levels, making continuation and reversion planning faster.',
  },
  {
    name: 'Quantum Liquidity Sweeper',
    description:
      'Tracks sweep behavior across internal and external liquidity so you can frame trap-to-expansion moves with higher confidence and tighter risk.',
  },
  {
    name: 'Quantum Cycle Matrix',
    description:
      'An upgraded cycle table system that organizes directional context, phase state, and confirmation layers into a single decision matrix.',
  },
  {
    name: 'Quantum Deviation Engine',
    description:
      'A premium statistical model built on deviation logic that spots stretch conditions, mean-reversion risk, and volatility imbalance with precision.',
  },
  {
    name: 'PO3 Range Engine',
    description:
      'A scalable PO3 range model for 243 and 729 structures that maps accumulation, manipulation, and expansion ranges for cleaner execution plans.',
  },
] as const;

const CUSTOM_INDICATOR_FEATURES = [
  'Personalized alert logic built around your trading model',
  'Custom session filters for London and New York execution windows',
  'Risk-based target mapping with configurable RR presets',
  'Market structure overlays tuned to your preferred timeframe',
  'One-click visibility controls for cleaner chart workflows',
  'Versioned updates and ongoing optimization support',
] as const;

export default function IndicatorsPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inquiryError, setInquiryError] = useState('');
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: featureSectionRef, isVisible: featureSectionVisible } = useScrollAnimation();
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { ref: customRef, isVisible: customVisible } = useScrollAnimation();
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation();

  const handleIndicatorTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const lastIndex = INDICATORS.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    setActiveFeature(nextIndex);
    const tab = document.getElementById(`indicator-tab-${nextIndex}`);
    if (tab instanceof HTMLButtonElement) {
      tab.focus();
    }
  };

  const handleInquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: inquiryForm.name.trim(),
      email: inquiryForm.email.trim(),
      message: inquiryForm.message.trim(),
      source: 'indicators-page',
    };

    if (!payload.name || !payload.email || !payload.message) {
      setInquiryStatus('error');
      setInquiryError('Please complete all fields before submitting.');
      return;
    }

    try {
      setInquiryStatus('sending');
      setInquiryError('');

      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = typeof body?.error === 'string' ? body.error : 'Unable to send inquiry right now.';
        throw new Error(message);
      }

      setInquiryStatus('sent');
      setInquiryForm({ name: '', email: '', message: '' });
    } catch (error) {
      setInquiryStatus('error');
      setInquiryError(error instanceof Error ? error.message : 'Unable to send inquiry right now.');
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="px-6 pt-28 pb-16 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Unlock Your Potential with
          </h1>
          <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--accent)] md:text-4xl lg:text-5xl">
            Fractal Model Indicator
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
            Crafted with precision, the Fractal Model Indicator is built to anticipate momentum shifts, swing
            formations, and orderflow continuations. It highlights key areas where price is most likely to deliver
            towards. Ensuring analysts are always ahead of the curve, instead of falling behind.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_var(--accent-glow)]"
          >
            Get Access Now
          </Link>
        </motion.div>
      </section>

      {/* Indicators - Accordion + Preview */}
      <section id="indicators" ref={featuresRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center font-heading text-3xl font-bold text-white md:text-4xl"
          >
            Indicator Engine. Fully Automated.
          </motion.h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Feature list */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={featuresVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-1"
              role="tablist"
              aria-label="QDS indicators"
            >
              {INDICATORS.map((indicator, i) => (
                <button
                  key={indicator.name}
                  onClick={() => setActiveFeature(i)}
                  onMouseEnter={() => setActiveFeature(i)}
                  onKeyDown={(event) => handleIndicatorTabKeyDown(event, i)}
                  role="tab"
                  id={`indicator-tab-${i}`}
                  aria-selected={activeFeature === i}
                  aria-controls="indicator-panel"
                  tabIndex={activeFeature === i ? 0 : -1}
                  className={`flex w-full items-center justify-between rounded-lg px-5 py-4 text-left transition-all ${
                    activeFeature === i
                      ? 'bg-white/5 text-white'
                      : 'text-white/50 hover:bg-white/[0.02] hover:text-white/70'
                  }`}
                >
                  <span className="text-sm font-medium">{indicator.name}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${activeFeature === i ? 'rotate-90' : ''}`}
                  />
                </button>
              ))}
            </motion.div>

            {/* Preview area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={featuresVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]"
              role="tabpanel"
              id="indicator-panel"
              aria-labelledby={`indicator-tab-${activeFeature}`}
            >
              <div className="flex min-h-[320px] w-full items-center justify-center p-8" aria-live="polite">
                <div className="max-w-md text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                    {INDICATORS[activeFeature].name}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                    {INDICATORS[activeFeature].description}
                  </p>
                  <BarChart3 className="mx-auto mt-5 h-10 w-10 text-white/15" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chart Preview */}
      <section id="preview" className="scroll-mt-24 px-6 pb-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]">
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#111]">
            <div className="text-center">
              <BarChart3 className="mx-auto h-20 w-20 text-white/10" />
              <p className="mt-2 text-sm text-white/20">Indicator Chart Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featureSectionRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featureSectionVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Feature Highlights</h2>
            <p className="mt-3 text-sm text-white/50 md:text-base">
              Designed to keep your analysis clean, fast, and repeatable across sessions.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((indicator, index) => (
              <motion.div
                key={`feature-card-${indicator.name}`}
                initial={{ opacity: 0, y: 16 }}
                animate={featureSectionVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white">{indicator.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{indicator.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" ref={pricingRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pricingVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <BentoPricing mode="indicators" />
            <p className="mt-4 text-center text-sm text-[#D4AF37]">
              Start your free trial and explore the full power of our system built on precision, timing, and real
              market logic. Once you see how it works in live conditions, you will not want to trade without it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Custom Indicator */}
      <section id="custom-indicator" ref={customRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={customVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(79,123,247,0.16),rgba(8,8,8,0.95)_55%)]"
          >
            <div className="grid gap-10 p-8 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Custom Build</p>
                <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2.5">
                  <Image
                    src="/logo/quantum_logo.png"
                    alt="Quantum logo"
                    width={56}
                    height={56}
                    className="h-12 w-12 object-contain"
                  />
                  <span className="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">Quantum</span>
                </div>
                <h3 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Need a Custom Indicator?</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                  We can tailor a private version of the Fractal Model stack around your workflow, confirmations,
                  and execution style. Built for traders who want a precise edge without bloated tooling.
                </p>
                <Link
                  href="#inquiry"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_28px_var(--accent-glow)]"
                >
                  Build Your Custom Indicator
                  <span className="text-base leading-none">-&gt;</span>
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {CUSTOM_INDICATOR_FEATURES.map((feature) => (
                  <div key={feature} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Indicator Inquiry */}
      <section id="inquiry" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(20,20,20,0.95),rgba(7,11,22,0.95))]">
          <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Custom Indicator Inquiry</p>
              <h3 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Send Inquiry</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
                Tell us what kind of indicator setup you need and the team will respond with a tailored plan,
                pricing, and delivery timeline.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <label htmlFor="inquiry-name" className="sr-only">
                Your name
              </label>
              <input
                id="inquiry-name"
                type="text"
                name="name"
                placeholder="Your name"
                value={inquiryForm.name}
                onChange={(event) =>
                  setInquiryForm({
                    ...inquiryForm,
                    name: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[var(--accent)] focus:outline-none"
                required
              />
              <label htmlFor="inquiry-email" className="sr-only">
                Your email
              </label>
              <input
                id="inquiry-email"
                type="email"
                name="email"
                placeholder="Your email"
                value={inquiryForm.email}
                onChange={(event) =>
                  setInquiryForm({
                    ...inquiryForm,
                    email: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[var(--accent)] focus:outline-none"
                required
              />
              <label htmlFor="inquiry-message" className="sr-only">
                Indicator requirements
              </label>
              <textarea
                id="inquiry-message"
                name="message"
                rows={5}
                placeholder="Describe your setup, markets, and what you want automated..."
                value={inquiryForm.message}
                onChange={(event) =>
                  setInquiryForm({
                    ...inquiryForm,
                    message: event.target.value,
                  })
                }
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[var(--accent)] focus:outline-none"
                required
              />

              <button
                type="submit"
                disabled={inquiryStatus === 'sending'}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inquiryStatus === 'sending' ? 'Sending...' : 'Send Inquiry'}
              </button>

              <div aria-live="polite" role="status">
                {inquiryStatus === 'sent' ? (
                  <p className="text-sm text-emerald-300">Inquiry sent successfully. We will contact you soon.</p>
                ) : null}
              </div>
              <div aria-live="assertive" role="alert">
                {inquiryStatus === 'error' ? <p className="text-sm text-red-300">{inquiryError}</p> : null}
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
