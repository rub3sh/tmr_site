'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BentoPricing } from '@/components/ui/bento-pricing';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import {
  ChevronDown, ArrowRight, MessageCircle, TrendingUp, Users, BookOpen, Play, BarChart3,
  Radio, LineChart, Library, FileDown, CalendarDays, Headphones, Globe, FileText,
} from 'lucide-react';

/* ─── Models Section ─── */
const MODELS = [
  {
    title: 'GoldBach Model',
    mentor: 'InnerEdge',
    desc: 'A mechanical continuation framework designed to align higher and lower timeframes into one simple execution plan.',
    image: '/images/GB.png',
  },
  {
    title: 'Quarterly Theory',
    mentor: 'InnerEdge',
    desc: 'A structured approach built to capture large range moves within the daily candle on a weekly basis.',
    image: '/images/QT.png',
  },
];

/* ─── Community Features ─── */
const COMMUNITY_FEATURES = [
  {
    icon: MessageCircle,
    desc: 'Engage with mentors who remain active on a daily basis to receive direct feedback on questions.',
  },
  {
    icon: TrendingUp,
    desc: 'Follow along with trade recaps, market lessons, and analysis posts through each week.',
  },
  {
    icon: Users,
    desc: 'Gain consistent access to the guidance of mentors and instructors in the community.',
  },
  {
    icon: BookOpen,
    desc: 'Work alongside other likeminded traders who are serious about their progress.',
  },
];

/* ─── Process Steps ─── */
const PROCESS_STEPS = [
  {
    tag: 'Onboarding',
    title: 'Immediately after checkout you will be redirected to a complete onboarding process to get you started in the right direction.',
  },
  {
    tag: 'Learning',
    title: 'Study the models and watch recorded videos as soon as you join with all content available to members from the start.',
  },
  {
    tag: 'Guidance',
    title: 'Experience learning in real time by receiving constant mentor insights through livestreams and new market lessons.',
  },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    stars: 5,
    title: '$58,000 Payout',
    quote: 'I started seeing consistent profits around the last two weeks of study. Completely changed the way I approach the markets.',
    name: 'Verified Member',
  },
  {
    stars: 5,
    title: '$20,000 Payout',
    quote: 'Ever since I studied the models, these were the results. In two months I\'m forever grateful!',
    name: 'Verified Member',
  },
  {
    stars: 5,
    title: 'Consistent Payouts',
    quote: 'Since joining the mentorship this year, I\'ve had quantum leaps. I\'m no longer taking sporadic payouts but one every month.',
    name: 'Verified Member',
  },
  {
    stars: 5,
    title: 'Five-Figure Months',
    quote: 'I took it seriously and have gone through the course material at a steady pace. It literally taught me what I need to be doing.',
    name: 'Verified Member',
  },
  {
    stars: 5,
    title: 'Became Profitable',
    quote: 'A life-changing month after joining the mentorship. This was the game changer I needed, the missing piece I\'d been looking for.',
    name: 'Verified Member',
  },
  {
    stars: 5,
    title: 'Live Transition',
    quote: 'We are moving to live. 3 months of consistently following the game plan has changed my trading forever.',
    name: 'Verified Member',
  },
];

/* ─── Team ─── */
const TEAM_MEMBERS = [
  {
    name: 'Mellow',
    role: 'Lead Mentor',
    summary: 'Leads model breakdowns, execution reviews, and weekly planning sessions.',
  },
  {
    name: 'InnerEdge',
    role: 'Strategy Mentor',
    summary: 'Focuses on market structure, quarterly framework, and risk discipline.',
  },
  {
    name: 'TMR Desk',
    role: 'Community Support',
    summary: 'Supports member onboarding, progress tracking, and accountability flow.',
  },
];

/* ─── Feature Cards (mentorship.png) ─── */
const FEATURE_CARDS = [
  {
    title: 'Live Trading Sessions',
    desc: 'Watch mentors execute trades in real time with full commentary and reasoning behind every decision.',
    icon: Play,
    accent: 'Viewers join daily',
  },
  {
    title: 'Market Analysis',
    desc: 'Daily breakdowns of market structure, key levels, and high-probability setups across forex, indices, and crypto.',
    icon: LineChart,
    accent: 'Updated daily',
  },
  {
    title: 'Community Chat',
    desc: 'Engage with mentors and fellow traders in real-time discussions, trade reviews, and Q&A sessions throughout the day.',
    icon: MessageCircle,
    accent: 'Always active',
  },
  {
    title: 'Resources & Tools',
    desc: 'Access downloadable templates, trade journals, risk calculators, and a growing library of educational PDFs.',
    icon: Globe,
    accent: 'Instant access',
  },
];

/* ─── Ecosystem Features (mentorship2.png) ─── */
const ECOSYSTEM_FEATURES = [
  {
    title: 'Daily Live Trading Streams',
    desc: 'Join mentors every session for live execution, commentary, and real-time market navigation.',
    icon: Radio,
  },
  {
    title: 'Daily Market Analysis',
    desc: 'Receive detailed breakdowns of structure, bias, and key levels before the market opens.',
    icon: BarChart3,
  },
  {
    title: 'On-Demand Course Library',
    desc: 'Study complete trading models and frameworks at your own pace with structured video content.',
    icon: Library,
  },
  {
    title: 'Downloadable Trading Templates',
    desc: 'Access ready-to-use journals, checklists, and risk management spreadsheets built by mentors.',
    icon: FileDown,
  },
  {
    title: 'Weekly Strategy Breakdowns',
    desc: 'Detailed reviews of the past week and forward-looking game plans for upcoming sessions.',
    icon: CalendarDays,
  },
  {
    title: '24/7 Discord Access',
    desc: 'Around-the-clock community access with mentor presence, trade sharing, and accountability.',
    icon: Headphones,
  },
];

/* ─── FAQ Items ─── */
const FAQ_ITEMS = [
  {
    q: 'How much time per day is needed to make progress?',
    a: 'Most members dedicate 1-2 hours daily for studying models and reviewing trade setups. Consistency matters more than volume.',
  },
  {
    q: 'What level of trading experience is required to join?',
    a: 'All levels welcome. The onboarding process starts from foundational concepts and builds up to advanced execution strategies.',
  },
  {
    q: 'How frequent is the guidance within the community?',
    a: 'Daily. Mentors are active every day providing feedback, analysis, and live market commentary.',
  },
  {
    q: 'Which markets are mainly focused on?',
    a: 'Primarily forex and indices (NAS100, US30, Gold). The models work across liquid markets.',
  },
  {
    q: 'How long after purchasing a membership is access granted?',
    a: 'Immediately. You\'ll receive access to all content and the community within minutes of checkout.',
  },
  {
    q: 'What type of trader is InnerEdgeCapital for?',
    a: 'Traders who want structure, discipline, and a repeatable system - not signals or get-rich-quick schemes.',
  },
];

function FAQItem({ item }: { item: (typeof FAQ_ITEMS)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-medium text-white md:text-base">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-white/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed text-white/50">{item.a}</p>
      </motion.div>
    </div>
  );
}

export default function MentorshipPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: modelsRef, isVisible: modelsVisible } = useScrollAnimation();
  const { ref: communityRef, isVisible: communityVisible } = useScrollAnimation();
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { ref: ecosystemRef, isVisible: ecosystemVisible } = useScrollAnimation();
  const { ref: processRef, isVisible: processVisible } = useScrollAnimation();
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation();
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation();
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Where traders end their search for{' '}
              <span className="text-white/60">consistency.</span>
            </h1>
            <p className="mt-4 text-base text-white/40 md:text-lg">
              The standard for trading education and guidance
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]/80 md:text-sm">
              TMR - THE MARKET REVELATION
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-[#222] border border-white/10" />
                <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/10" />
              </div>
              <span className="text-xs text-white/40">Guided by mentors</span>
            </div>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              Start today <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Chart preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={heroVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]"
          >
            <div className="aspect-video w-full bg-gradient-to-br from-[#0a0a0a] to-[#111] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-white/10" />
                <p className="mt-2 text-xs text-white/20">Live Chart Preview</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Models */}
      <section id="models" ref={modelsRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={modelsVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Models</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              Refinement done for you.
            </h2>
            <p className="mt-2 text-sm text-white/40">Start learning complete systems the moment you join</p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {MODELS.map((model, i) => (
              <motion.div
                key={model.title}
                initial={{ opacity: 0, y: 20 }}
                animate={modelsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#0d0d15] to-[#111]">
                  <Image
                    src={model.image}
                    alt={model.title}
                    width={600}
                    height={375}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white">{model.title}</h3>
                  <p className="mt-1 text-xs text-white/30">{model.mentor}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{model.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" ref={communityRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={communityVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Community</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              The environment serious<br />traders rely on.
            </h2>
            <p className="mt-2 text-sm text-white/40">Real daily interaction with mentors and instructors</p>
          </motion.div>

          {/* Discord-like preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={communityVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]"
          >
            <div className="flex">
              <div className="hidden w-56 border-r border-white/5 bg-[#0d0d0d] p-4 md:block">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                  <div className="h-8 w-8 rounded-full bg-[#1a1a1a]" />
                  <span className="text-xs font-medium text-white/60">InnerEdgeCapital</span>
                </div>
                <div className="mt-4 space-y-1 text-xs text-white/30">
                  <p className="px-2 py-1 text-white/20"># announcements</p>
                  <p className="px-2 py-1 text-white/20"># testimonials</p>
                  <p className="px-2 py-1 text-white/20"># chat</p>
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Mentor Livestream
                  <span className="ml-auto rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">LIVE</span>
                </div>
                <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-[#111] border border-white/5">
                  <BarChart3 className="h-12 w-12 text-white/10" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITY_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={communityVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <Icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs leading-relaxed text-white/50">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Cards (mentorship.png) */}
      <section ref={featuresRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">What You Get</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              Everything you need to<br />trade with confidence.
            </h2>
            <p className="mt-2 text-sm text-white/40">Core pillars of the mentorship experience</p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 transition-colors hover:border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                      <Icon className="h-5 w-5 text-white/40" strokeWidth={1.5} />
                    </div>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/25">
                      {card.accent}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">{card.desc}</p>

                  {/* Decorative bottom gradient line */}
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High Performance Ecosystem (mentorship2.png) */}
      <section ref={ecosystemRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ecosystemVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25">
              Included With Your Membership
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              High Performance Ecosystem
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-white/35">
              A complete suite of tools, content, and community access designed to accelerate your growth.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={ecosystemVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
                  className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 transition-colors hover:border-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-5 w-5 text-white/40" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/40">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" ref={processRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={processVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Process</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              Enter into a structured process.
            </h2>
            <p className="mt-2 text-sm text-white/40">A complete ecosystem that optimizes your learning</p>
          </motion.div>

          <div className="mt-12 space-y-12">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={processVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                  {i < PROCESS_STEPS.length - 1 && <div className="mt-1 w-px flex-1 bg-white/10" />}
                </div>
                <div className="pb-8">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    {step.tag}
                  </span>
                  <p className="mt-2 text-base leading-relaxed text-white/70 md:text-lg">{step.title}</p>
                </div>
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
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Pricing</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              Choose your plan.
            </h2>
            <p className="mt-2 text-sm text-white/40">Start your path to consistent trading with a plan that fits your pace.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={pricingVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-12"
          >
            <BentoPricing />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Testimonials</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              See what our students<br />have to say.
            </h2>
            <p className="mt-2 text-sm text-white/40">
              Proven success in everything from reaching the first payout to becoming a full-time trader
            </p>
          </motion.div>

          <div className="mt-10 flex items-center gap-4 mb-8">
            <div className="rounded-lg border border-white/5 bg-[#0a0a0a] px-6 py-4">
              <p className="text-3xl font-bold text-white">450+</p>
              <p className="text-xs text-white/30">5 star reviews</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={testimonialsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-xs text-yellow-400">&#9733;</span>
                  ))}
                </div>
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{t.quote}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#1a1a1a]" />
                  <span className="text-[11px] text-white/30">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="team" ref={teamRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={teamVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Team</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              Learn directly from the trading desk.
            </h2>
            <p className="mt-2 text-sm text-white/40">The mentors behind the systems, coaching, and accountability.</p>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                animate={teamVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-xl border border-white/5 bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{member.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-white/35">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/55">{member.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" ref={faqRef} className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">FAQ</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl">
              The answers to your questions.
            </h2>
            <p className="mt-2 text-sm text-white/40">Find answers to frequently asked questions</p>
          </motion.div>

          <div className="mt-10">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
