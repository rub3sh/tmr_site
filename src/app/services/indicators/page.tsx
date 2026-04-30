'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BentoPricing } from '@/components/ui/bento-pricing';
import {
  ArrowRight, BarChart3, Zap, Bell, Eye, RefreshCw, Target, Layers,
  TrendingUp, Activity, CheckCircle2, Send, ChevronRight,
} from 'lucide-react';

const INDICATORS = [
  { name: 'Quantum Cycle Engine', tag: 'Cycle Mapping', icon: RefreshCw, description: 'Built around QT Cycles and True Opens, this engine maps phase transitions and opening intent so you can align entries with the cleanest directional move.' },
  { name: 'Quantum Algo Clock', tag: 'Timing', icon: Bell, description: 'A GB plus time plus alerts command center that keeps your execution synced to high-value market windows with automatic timing prompts.' },
  { name: 'Inducement Timing Model', tag: 'Pre-Displacement', icon: Eye, description: 'A cleaner macro-time framework that identifies inducement phases before displacement, helping you avoid early entries and improve confirmation timing.' },
  { name: 'Quantum SMT Engine', tag: 'Divergence', icon: Activity, description: 'Precision SMT detection across nano and micro structure, with smart alerts that flag divergence opportunities as they form in real time.' },
  { name: 'Quantum Imbalance Finder', tag: 'Efficiency Zones', icon: Layers, description: 'A branded imbalance scanner that highlights clean inefficiency zones and reaction levels, making continuation and reversion planning faster.' },
  { name: 'Quantum Liquidity Sweeper', tag: 'Trap Detection', icon: Target, description: 'Tracks sweep behavior across internal and external liquidity so you can frame trap-to-expansion moves with higher confidence and tighter risk.' },
  { name: 'Quantum Cycle Matrix', tag: 'Decision Matrix', icon: TrendingUp, description: 'An upgraded cycle table system that organizes directional context, phase state, and confirmation layers into a single decision matrix.' },
  { name: 'Quantum Deviation Engine', tag: 'Statistical Model', icon: BarChart3, description: 'A premium statistical model built on deviation logic that spots stretch conditions, mean-reversion risk, and volatility imbalance with precision.' },
  { name: 'PO3 Range Engine', tag: 'Range Structure', icon: Zap, description: 'A scalable PO3 range model for 243 and 729 structures that maps accumulation, manipulation, and expansion ranges for cleaner execution plans.' },
] as const;

const CUSTOM_FEATURES = [
  'Personalised alert logic built around your trading model',
  'Custom session filters for London and New York windows',
  'Risk-based target mapping with configurable RR presets',
  'Market structure overlays tuned to your timeframe',
  'One-click visibility controls for cleaner chart workflows',
  'Versioned updates and ongoing optimisation support',
] as const;

const STATS = [
  { value: '9', label: 'Premium Indicators' },
  { value: '3+', label: 'Asset Classes' },
  { value: '24/7', label: 'Alert System' },
  { value: '100%', label: 'Pine Script' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
      <span className="h-px w-4 bg-white/20" />
      {children}
    </span>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as const,
  transition: { duration: 0.5, delay },
});

export default function IndicatorsPage() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  function handleTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = INDICATORS.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`ind-tab-${next}`)?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { name: form.name.trim(), email: form.email.trim(), message: form.message.trim(), source: 'indicators-page' };
    if (!payload.name || !payload.email || !payload.message) { setStatus('error'); setErrMsg('Please complete all fields.'); return; }
    try {
      setStatus('sending'); setErrMsg('');
      const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const b = await res.json().catch(() => null); throw new Error(b?.error ?? 'Unable to send inquiry.'); }
      setStatus('sent'); setForm({ name: '', email: '', message: '' });
    } catch (err) { setStatus('error'); setErrMsg(err instanceof Error ? err.message : 'Unable to send inquiry.'); }
  }

  const ActiveIcon = INDICATORS[active].icon;

  return (
    <main className="min-h-screen bg-black selection:bg-white/15">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 md:pt-38">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.05),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <Zap className="h-3 w-3" /> Quantum Indicator Suite
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="mt-6 text-center">
            <h1 className="font-heading text-[2.6rem] font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
              Precision tools built for<br />
              <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">serious traders.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/40 md:text-base">
              The Fractal Model Indicator suite anticipates momentum shifts, swing formations, and orderflow continuations — keeping analysts ahead of the curve.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/92 hover:gap-3 active:scale-[0.98]">
              Get Access Now <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#indicators" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:border-white/20 hover:text-white/80">
              View Indicators
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/6 bg-white/[0.03] px-4 py-4 text-center">
                <p className="font-heading text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-[11px] text-white/30">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }} className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-[#080808]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-white/40">Quantum Cycle Engine — NAS100 / 15m</span>
              </div>
              <div className="flex items-center gap-3">
                {['1m','5m','15m','1H'].map((tf,i) => <span key={tf} className={`text-[10px] font-medium ${i===2?'text-white':'text-white/20'}`}>{tf}</span>)}
              </div>
            </div>
            <div className="aspect-[21/7] w-full p-4">
              <svg viewBox="0 0 840 200" className="h-full w-full" preserveAspectRatio="none">
                {[40,80,120,160].map(y=><line key={y} x1="0" y1={y} x2="840" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>)}
                {[0,120,240,360,480,600,720,840].map(x=><line key={x} x1={x} y1="0" x2={x} y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>)}
                {([[10,150,100,90,165,true],[35,102,140,95,152,false],[60,138,95,88,145,true],[85,97,72,65,108,true],[110,74,95,68,102,false],[135,93,68,60,98,true],[160,70,88,62,95,false],[185,86,70,62,92,true],[210,72,55,46,78,true],[235,57,78,50,85,false],[260,76,58,50,82,true],[285,60,48,40,66,true],[310,50,68,42,74,false],[335,66,52,44,72,true],[360,54,44,36,60,true],[385,46,60,38,65,false],[410,58,42,34,64,true],[435,44,56,36,62,false],[460,54,38,30,58,true],[485,40,52,32,56,false],[510,50,36,28,54,true],[535,38,48,30,52,false],[560,46,32,24,50,true],[585,34,44,26,48,false],[610,42,30,22,46,true],[635,32,40,24,44,false],[660,38,28,20,42,true],[685,30,38,22,42,false],[710,36,24,16,38,true],[735,26,34,18,38,false],[760,32,22,14,36,true],[785,24,30,16,34,false],[810,28,18,10,30,true]] as [number,number,number,number,number,boolean][]).map(([x,o,c,h,l,b],i)=>(
                  <g key={i}>
                    <line x1={x+9} y1={h} x2={x+9} y2={l} stroke={b?'#4ade80':'#f87171'} strokeWidth="1" opacity="0.4"/>
                    <rect x={x} y={Math.min(o,c)} width="18" height={Math.max(Math.abs(o-c),2)} fill={b?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.2)'} stroke={b?'#4ade80':'#f87171'} strokeWidth="0.8" rx="1.5"/>
                  </g>
                ))}
                {[160,360,560,760].map(x=><line key={x} x1={x} y1="0" x2={x} y2="200" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="3,3"/>)}
                <path d="M 10 150 C 150 120 300 90 450 70 S 650 40 840 20" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="flex items-center gap-6 border-t border-white/5 px-5 py-3">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400 opacity-60"/><span className="text-[10px] text-white/30">Cycle Phase</span></div>
              <div className="flex items-center gap-1.5"><span className="h-px w-4 bg-green-400 opacity-40"/><span className="text-[10px] text-white/30">Bullish</span></div>
              <div className="flex items-center gap-1.5"><span className="h-px w-4 bg-red-400 opacity-40"/><span className="text-[10px] text-white/30">Bearish</span></div>
              <div className="ml-auto text-[10px] text-green-400 font-medium">+2.34% <span className="text-white/20 font-normal">today</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Indicator Showcase */}
      <section id="indicators" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="mb-12">
            <SectionLabel>Indicator Suite</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Nine engines. One unified edge.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/35">Each indicator is purpose-built for a specific aspect of market structure — no overlap, no redundancy.</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
            <div className="flex flex-col gap-0.5 rounded-2xl border border-white/6 bg-[#060606] p-2" role="tablist" aria-label="Quantum indicators">
              {INDICATORS.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <button key={ind.name} id={`ind-tab-${i}`} role="tab" aria-selected={active===i} aria-controls="ind-panel" tabIndex={active===i?0:-1}
                    onClick={()=>setActive(i)} onMouseEnter={()=>setActive(i)} onKeyDown={(e)=>handleTabKey(e,i)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${active===i?'bg-white/[0.07] text-white':'text-white/40 hover:bg-white/[0.03] hover:text-white/65'}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${active===i?'bg-white/10':'bg-white/[0.04]'}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{ind.name}</p>
                      <p className={`text-[10px] ${active===i?'text-white/40':'text-white/20'}`}>{ind.tag}</p>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-all ${active===i?'opacity-100 translate-x-0.5':'opacity-0'}`}/>
                  </button>
                );
              })}
            </div>
            <div id="ind-panel" role="tabpanel" aria-labelledby={`ind-tab-${active}`} className="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#080808]">
              <div className="flex-1 border-b border-white/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">{INDICATORS[active].tag}</p>
                    <h3 className="mt-1 text-xl font-bold text-white">{INDICATORS[active].name}</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                    <ActiveIcon className="h-4 w-4 text-white/40" strokeWidth={1.5}/>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/50" aria-live="polite">{INDICATORS[active].description}</p>
                <div className="mt-5 overflow-hidden rounded-xl border border-white/5 bg-[#060606] p-4">
                  <svg viewBox="0 0 300 80" className="w-full opacity-50">
                    {[20,40,60].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>)}
                    {([[5,60,42,38,65,true],[22,44,56,38,60,false],[39,54,38,30,58,true],[56,40,52,32,56,false],[73,50,36,28,54,true],[90,38,48,30,52,false],[107,46,32,24,50,true],[124,34,44,26,48,false],[141,42,30,22,46,true],[158,32,40,24,44,false],[175,38,28,20,42,true],[192,30,38,22,42,false],[209,36,24,16,38,true],[226,26,34,18,36,false],[243,32,22,14,35,true],[260,24,30,16,33,false],[277,28,18,10,30,true]] as [number,number,number,number,number,boolean][]).map(([x,o,c,h,l,b],i)=>(
                      <g key={i}>
                        <line x1={x+7} y1={h} x2={x+7} y2={l} stroke={b?'#4ade80':'#f87171'} strokeWidth="0.8" opacity="0.5"/>
                        <rect x={x} y={Math.min(o,c)} width="14" height={Math.max(Math.abs(o-c),1.5)} fill={b?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.2)'} stroke={b?'#4ade80':'#f87171'} strokeWidth="0.6" rx="1"/>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
              <div className="p-5">
                <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/92 active:scale-[0.98]">
                  Access {INDICATORS[active].name} <ArrowRight className="h-4 w-4"/>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <SectionLabel>What's Included</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Every tool you need. Nothing you don't.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/35">Designed to keep your analysis clean, fast, and repeatable across sessions.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <motion.div key={ind.name} {...fadeUp(0.03+i*0.04)} className="group rounded-xl border border-white/5 bg-[#080808] p-5 transition-all hover:border-white/10 hover:bg-[#0a0a0a]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] transition group-hover:border-white/12">
                      <Icon className="h-3.5 w-3.5 text-white/35" strokeWidth={1.5}/>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{ind.name}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium text-white/25">{ind.tag}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-white/40">{ind.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="mb-12">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Access the full suite.</h2>
            <p className="mt-3 text-sm text-white/35">Start your free trial and explore the full power of the system in live conditions.</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)}><BentoPricing mode="indicators" /></motion.div>
        </div>
      </section>

      {/* Custom Indicator */}
      <section id="custom-indicator" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="overflow-hidden rounded-2xl border border-white/8 bg-[#080808]">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-white/5 p-8 lg:border-b-0 lg:border-r md:p-10">
                <SectionLabel>Custom Build</SectionLabel>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                    <Image src="/logo/quantum_logo.png" alt="Quantum" width={28} height={28} className="object-contain"/>
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">Quantum</span>
                </div>
                <h3 className="mt-4 font-heading text-2xl font-bold text-white md:text-3xl">Need a Custom Indicator?</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45 md:text-base">We can tailor a private version of the Fractal Model stack around your workflow, confirmations, and execution style.</p>
                <a href="#inquiry" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/92 active:scale-[0.98]">
                  Build Custom Indicator <ArrowRight className="h-4 w-4"/>
                </a>
              </div>
              <div className="p-8 md:p-10">
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/25">What's customisable</p>
                <div className="space-y-3.5">
                  {CUSTOM_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/20" strokeWidth={1.5}/>
                      <span className="text-sm text-white/55">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="scroll-mt-24 px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp()} className="overflow-hidden rounded-2xl border border-white/8 bg-[#080808]">
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              <div className="border-b border-white/5 p-8 lg:border-b-0 lg:border-r md:p-10">
                <SectionLabel>Custom Indicator Inquiry</SectionLabel>
                <h3 className="mt-3 font-heading text-2xl font-bold text-white md:text-3xl">Send Inquiry</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">Tell us what kind of indicator setup you need and the team will respond with a tailored plan, pricing, and delivery timeline.</p>
                <div className="mt-8 space-y-3.5">
                  {['We respond within 24 hours','Fully private — no public release','Ongoing support included'].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20"/>
                      <span className="text-xs text-white/35">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 md:p-10">
                {status === 'sent' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                      <CheckCircle2 className="h-6 w-6 text-green-400"/>
                    </div>
                    <p className="text-base font-semibold text-white">Inquiry sent!</p>
                    <p className="text-sm text-white/35">We'll be in touch within 24 hours.</p>
                    <button onClick={()=>setStatus('idle')} className="mt-2 text-xs text-white/25 underline underline-offset-2 hover:text-white/50">Send another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div><label htmlFor="inq-name" className="sr-only">Your name</label>
                      <input id="inq-name" type="text" placeholder="Your name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}
                        className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 transition focus:border-white/20 focus:bg-white/[0.05] focus:outline-none"/>
                    </div>
                    <div><label htmlFor="inq-email" className="sr-only">Your email</label>
                      <input id="inq-email" type="email" placeholder="Your email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}
                        className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 transition focus:border-white/20 focus:bg-white/[0.05] focus:outline-none"/>
                    </div>
                    <div><label htmlFor="inq-msg" className="sr-only">Indicator requirements</label>
                      <textarea id="inq-msg" rows={5} placeholder="Describe your setup, markets, and what you want automated..." required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}
                        className="w-full resize-none rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 transition focus:border-white/20 focus:bg-white/[0.05] focus:outline-none"/>
                    </div>
                    {status==='error' && <p role="alert" className="text-xs text-red-400">{errMsg}</p>}
                    <button type="submit" disabled={status==='sending'} className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/92 disabled:opacity-60 active:scale-[0.98]">
                      {status==='sending'?'Sending…':<><Send className="h-3.5 w-3.5"/>Send Inquiry</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
