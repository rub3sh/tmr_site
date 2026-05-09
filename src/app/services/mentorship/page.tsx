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
  Radio, LineChart, Library, FileDown, CalendarDays, Headphones, Globe,
  CheckCircle2, Star,
} from 'lucide-react';

/* ─── Data ─── */
const MODELS = [
  {
    title: 'GoldBach Model',
    mentor: 'InnerEdge',
    tag: 'Continuation Framework',
    desc: 'A mechanical continuation framework designed to align higher and lower timeframes into one simple execution plan.',
    image: '/images/GB.png',
  },
  {
    title: 'Quarterly Theory',
    mentor: 'InnerEdge',
    tag: 'Range Capture',
    desc: 'A structured approach built to capture large range moves within the daily candle on a weekly basis.',
    image: '/images/QT.png',
  },
];

const COMMUNITY_FEATURES = [
  {
    icon: MessageCircle,
    title: 'Direct Mentor Access',
    desc: 'Engage with mentors who remain active daily to receive direct feedback on your questions.',
  },
  {
    icon: TrendingUp,
    title: 'Trade Recaps & Analysis',
    desc: 'Follow along with trade recaps, market lessons, and analysis posts through each week.',
  },
  {
    icon: Users,
    title: 'Consistent Guidance',
    desc: 'Gain continuous access to guidance from mentors and instructors in the community.',
  },
  {
    icon: BookOpen,
    title: 'Serious Traders Only',
    desc: 'Work alongside likeminded traders who are committed to their long-term progress.',
  },
];

const PROCESS_STEPS = [
  {
    tag: 'Step 01 — Onboarding',
    title: 'Get started immediately',
    desc: 'Immediately after checkout you will be redirected to a complete onboarding process to get you started in the right direction.',
  },
  {
    tag: 'Step 02 — Learning',
    title: 'All content, from day one',
    desc: 'Study the models and watch recorded videos as soon as you join — all content is available to members from the start.',
  },
  {
    tag: 'Step 03 — Guidance',
    title: 'Real-time mentor insights',
    desc: 'Experience learning in real time by receiving constant mentor insights through livestreams and new market lessons.',
  },
];

const TESTIMONIALS = [
  {
    title: '$58,000 Payout',
    quote: 'I started seeing consistent profits around the last two weeks of study. Completely changed the way I approach the markets.',
    name: 'Verified Member',
  },
  {
    title: '$20,000 Payout',
    quote: "Ever since I studied the models, these were the results. In two months I'm forever grateful!",
    name: 'Verified Member',
  },
  {
    title: 'Consistent Payouts',
    quote: "Since joining the mentorship this year, I've had quantum leaps. I'm no longer taking sporadic payouts but one every month.",
    name: 'Verified Member',
  },
  {
    title: 'Five-Figure Months',
    quote: 'I took it seriously and have gone through the course material at a steady pace. It literally taught me what I need to be doing.',
    name: 'Verified Member',
  },
  {
    title: 'Became Profitable',
    quote: "A life-changing month after joining the mentorship. This was the game changer I needed — the missing piece I'd been looking for.",
    name: 'Verified Member',
  },
  {
    title: 'Live Transition',
    quote: 'We are moving to live. 3 months of consistently following the game plan has changed my trading forever.',
    name: 'Verified Member',
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Mellow',
    initials: 'ME',
    role: 'Lead Mentor',
    summary: 'Leads model breakdowns, execution reviews, and weekly planning sessions.',
    color: 'from-white/10 to-white/5',
  },
  {
    name: 'InnerEdge',
    initials: 'IE',
    role: 'Strategy Mentor',
    summary: 'Focuses on market structure, quarterly framework, and risk discipline.',
    color: 'from-white/10 to-white/5',
  },
  {
    name: 'TMR Desk',
    initials: 'TD',
    role: 'Community Support',
    summary: 'Supports member onboarding, progress tracking, and accountability flow.',
    color: 'from-white/10 to-white/5',
  },
];

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

const ECOSYSTEM_FEATURES = [
  { title: 'Daily Live Trading Streams', desc: 'Join mentors every session for live execution, commentary, and real-time market navigation.', icon: Radio },
  { title: 'Daily Market Analysis', desc: 'Receive detailed breakdowns of structure, bias, and key levels before the market opens.', icon: BarChart3 },
  { title: 'On-Demand Course Library', desc: 'Study complete trading models and frameworks at your own pace with structured video content.', icon: Library },
  { title: 'Downloadable Templates', desc: 'Access ready-to-use journals, checklists, and risk management spreadsheets built by mentors.', icon: FileDown },
  { title: 'Weekly Strategy Breakdowns', desc: 'Detailed reviews of the past week and forward-looking game plans for upcoming sessions.', icon: CalendarDays },
  { title: '24/7 Discord Access', desc: 'Around-the-clock community access with mentor presence, trade sharing, and accountability.', icon: Headphones },
];

const FAQ_ITEMS = [
  { q: 'How much time per day is needed to make progress?', a: 'Most members dedicate 1–2 hours daily for studying models and reviewing trade setups. Consistency matters more than volume.' },
  { q: 'What level of trading experience is required to join?', a: 'All levels are welcome. The onboarding process starts from foundational concepts and builds up to advanced execution strategies.' },
  { q: 'How frequent is the guidance within the community?', a: 'Daily. Mentors are active every day providing feedback, analysis, and live market commentary.' },
  { q: 'Which markets are mainly focused on?', a: 'Primarily forex and indices (NAS100, US30, Gold). The models work across all liquid markets.' },
  { q: 'How long after purchasing is access granted?', a: "Immediately. You'll receive access to all content and the community within minutes of checkout." },
  { q: 'What type of trader is TheMarketRevelation for?', a: 'Traders who want structure, discipline, and a repeatable system — not signals or get-rich-quick schemes.' },
];

/* ─── Micro Components ─── */
function FAQItem({ item }: { item: (typeof FAQ_ITEMS)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-white/8 transition-colors ${open ? 'border-white/12' : ''}`}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="pr-6 text-sm font-medium text-white/80 group-hover:text-white transition-colors md:text-base">{item.q}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 transition-all duration-300 ${open ? 'border-white/20 bg-white/8 rotate-180' : 'bg-transparent'}`}>
          <ChevronDown className="h-3.5 w-3.5 text-white/40" />
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 pr-8 text-sm leading-relaxed text-white/45">{item.a}</p>
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
      <span className="h-px w-4 bg-white/20" />
      {children}
    </span>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay },
});

/* ─── Page ─── */
export default function MentorshipPage() {
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation();

  return (
    <main className="min-h-screen bg-black selection:bg-white/15">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 md:pt-38">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(255,255,255,0.04),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Text — animates immediately, no IntersectionObserver gate */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              TMR — The Market Revelation
            </div>

            <h1 className="font-heading text-[2.6rem] font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Where traders end their{' '}
              <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                search for consistency.
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-white/40 md:text-lg">
              The standard for trading education and guidance — structured systems, daily mentors, and a community that holds you accountable.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/92 hover:gap-3 active:scale-[0.98]"
              >
                Start today <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/40 transition-colors hover:text-white/70"
              >
                View pricing <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2.5">
                {['M', 'I', 'T'].map((l) => (
                  <div key={l} className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-[#1a1a1a] text-[10px] font-medium text-white/60">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-white/30">450+ verified student reviews</p>
              </div>
            </div>
          </motion.div>

          {/* Chart card — animates immediately */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#080808]">
              {/* Chart header */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-white/50">Mentor Livestream</span>
                </div>
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400">LIVE</span>
              </div>

              {/* Stylised chart */}
              <div className="aspect-video w-full bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-5">
                <svg viewBox="0 0 400 200" className="h-full w-full opacity-60" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[50, 100, 150].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  {/* Candle bodies */}
                  {[
                    { x: 20, open: 140, close: 100, high: 90, low: 155, bull: true },
                    { x: 55, open: 102, close: 130, high: 95, low: 140, bull: false },
                    { x: 90, open: 128, close: 90, high: 82, low: 138, bull: true },
                    { x: 125, open: 92, close: 70, high: 62, low: 105, bull: true },
                    { x: 160, open: 72, close: 95, high: 65, low: 108, bull: false },
                    { x: 195, open: 93, close: 60, high: 50, low: 100, bull: true },
                    { x: 230, open: 62, close: 88, high: 55, low: 95, bull: false },
                    { x: 265, open: 86, close: 65, high: 58, low: 100, bull: true },
                    { x: 300, open: 67, close: 45, high: 38, low: 75, bull: true },
                    { x: 335, open: 47, close: 72, high: 38, low: 80, bull: false },
                    { x: 370, open: 70, close: 50, high: 42, low: 78, bull: true },
                  ].map((c, i) => (
                    <g key={i}>
                      <line x1={c.x + 12} y1={c.high} x2={c.x + 12} y2={c.low} stroke={c.bull ? '#4ade80' : '#f87171'} strokeWidth="1.5" opacity="0.5" />
                      <rect
                        x={c.x}
                        y={Math.min(c.open, c.close)}
                        width="24"
                        height={Math.abs(c.open - c.close)}
                        fill={c.bull ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}
                        stroke={c.bull ? '#4ade80' : '#f87171'}
                        strokeWidth="1"
                        rx="2"
                      />
                    </g>
                  ))}
                  {/* Trend line */}
                  <path
                    d="M 20 140 C 80 120 140 100 200 80 S 300 60 380 50"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>

              {/* Bottom ticker */}
              <div className="flex items-center gap-6 border-t border-white/5 px-5 py-3">
                {[['NAS100', '+1.2%', true], ['XAUUSD', '-0.4%', false], ['GBP/USD', '+0.7%', true]].map(([pair, chg, up]) => (
                  <div key={pair as string} className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-white/30">{pair}</span>
                    <span className={`text-[10px] font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>{chg}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Models ── */}
      <section id="models" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>Models</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              Refinement done for you.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">Start learning complete, battle-tested systems the moment you join.</p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {MODELS.map((model, i) => (
              <motion.div
                key={model.title}
                {...fadeUp(i * 0.12)}
                className="group overflow-hidden rounded-2xl border border-white/6 bg-[#080808] transition-colors hover:border-white/10"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
                  <Image
                    src={model.image}
                    alt={model.title}
                    fill
                    className="object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute top-4 left-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 backdrop-blur-sm">
                    {model.tag}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{model.title}</h3>
                      <p className="mt-0.5 text-xs text-white/25">by {model.mentor}</p>
                    </div>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white/15" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">{model.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section id="community" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>Community</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              The environment serious<br className="hidden md:block" /> traders rely on.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">Real daily interaction with mentors and instructors — not just a Discord server.</p>
          </motion.div>

          {/* Discord mockup */}
          <motion.div {...fadeUp(0.15)} className="mt-10 overflow-hidden rounded-2xl border border-white/6 bg-[#080808]">
            <div className="flex">
              <div className="hidden w-56 shrink-0 border-r border-white/5 bg-[#060606] p-4 md:block">
                <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">IE</div>
                  <span className="text-xs font-medium text-white/50">TheMarketRevelation</span>
                </div>
                <div className="mt-5 space-y-0.5">
                  {['# announcements', '# signals', '# testimonials', '# market-chat', '# trade-reviews'].map((ch) => (
                    <p key={ch} className="rounded px-3 py-1.5 text-xs text-white/20 transition-colors hover:bg-white/[0.03] hover:text-white/35 cursor-default">
                      {ch}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  Mentor Livestream Active
                  <span className="ml-auto rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400">LIVE</span>
                </div>
                <div className="mt-4 flex aspect-video items-center justify-center rounded-xl border border-white/5 bg-[#0d0d0d]">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    </div>
                    <p className="mt-3 text-xs text-white/20">Live stream in progress</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="flex -space-x-1.5">
                    {['A', 'B', 'C', 'D'].map((l) => (
                      <div key={l} className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-[#1a1a1a] text-[9px] text-white/40">{l}</div>
                    ))}
                  </div>
                  <span className="text-[11px] text-white/25">128 members watching</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITY_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp(0.08 + i * 0.08)}
                  className="rounded-xl border border-white/5 bg-[#080808] p-5 transition-colors hover:border-white/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                    <Icon className="h-4.5 w-4.5 text-white/40" strokeWidth={1.5} />
                  </div>
                  <h4 className="mt-3.5 text-sm font-semibold text-white">{f.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>What You Get</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              Everything you need to<br className="hidden md:block" /> trade with confidence.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">Core pillars of the mentorship experience.</p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  {...fadeUp(0.08 + i * 0.08)}
                  className="group relative overflow-hidden rounded-2xl border border-white/6 bg-[#080808] p-6 transition-all hover:border-white/12 hover:bg-[#0a0a0a]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] transition-colors group-hover:border-white/12 group-hover:bg-white/[0.06]">
                      <Icon className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                    </div>
                    <span className="rounded-full border border-white/6 px-2.5 py-1 text-[10px] font-medium text-white/60">
                      {card.accent}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/38">{card.desc}</p>
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-white/6 via-white/3 to-transparent" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ecosystem ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp()} className="text-center">
            <SectionLabel>Included With Membership</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">High Performance Ecosystem</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/35">
              A complete suite of tools, content, and community access designed to accelerate your growth as a trader.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp(0.05 + i * 0.06)}
                  className="group rounded-2xl border border-white/5 bg-[#080808] p-6 transition-all hover:border-white/10 hover:bg-[#0a0a0a]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04]">
                    <Icon className="h-4.5 w-4.5 text-white/35" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/38">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              Enter into a structured process.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">A complete ecosystem that optimises your learning from day one.</p>
          </motion.div>

          <div className="mt-14 space-y-0">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.tag}
                {...fadeUp(0.12 + i * 0.12)}
                className="relative flex gap-8"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#0a0a0a] text-[10px] font-bold text-white/35">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-gradient-to-b from-white/10 to-transparent" style={{ minHeight: 48 }} />
                  )}
                </div>
                <div className="pb-12">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">{step.tag}</span>
                  <h3 className="mt-2 text-lg font-bold text-white md:text-xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/42">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" ref={pricingRef} className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={pricingVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Choose your plan.</h2>
            <p className="mt-2.5 text-sm text-white/35">Start your path to consistent trading with a plan that fits your pace.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={pricingVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
            className="mt-12"
          >
            <BentoPricing />
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              Results that speak for themselves.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">
              From first payouts to full-time trading — real outcomes from verified members.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-8 flex items-center gap-4">
            <div className="rounded-xl border border-white/6 bg-[#080808] px-6 py-4">
              <p className="text-2xl font-bold text-white">450+</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-white/30">verified reviews</p>
              </div>
            </div>
          </motion.div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.05 + i * 0.07)}
                className="flex flex-col rounded-xl border border-white/6 bg-[#080808] p-5 transition-colors hover:border-white/10"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-white/45">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-[9px] font-bold text-white/50">V</div>
                  <span className="text-[11px] text-white/28">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>Team</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              Learn directly from the trading desk.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">The mentors behind the systems, coaching, and accountability.</p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.1)}
                className="group rounded-2xl border border-white/6 bg-[#080808] p-6 transition-colors hover:border-white/10"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-sm font-bold text-white/70 ring-1 ring-white/8`}>
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">{member.role}</p>
                  </div>
                </div>
                <div className="mt-4 h-px bg-gradient-to-r from-white/6 to-transparent" />
                <p className="mt-4 text-sm leading-relaxed text-white/45">{member.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp()}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">
              The answers to your questions.
            </h2>
            <p className="mt-2.5 text-sm text-white/35">Everything you need to know before joining.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="mt-10">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="mt-14 rounded-2xl border border-white/6 bg-[#080808] p-8 text-center">
            <p className="text-sm text-white/40">Still have questions?</p>
            <p className="mt-1 text-lg font-semibold text-white">We're here to help.</p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/92 active:scale-[0.98]"
            >
              Join the community <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
