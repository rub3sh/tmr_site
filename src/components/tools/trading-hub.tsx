'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calculator, Calendar, BarChart2, Activity,
  ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Check,
} from 'lucide-react';

/* ─── Tabs ─────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'forex', label: 'Forex Calculator', icon: Calculator },
  { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
  { id: 'futures', label: 'Futures Scale', icon: BarChart2 },
  { id: 'sentiment', label: 'Sentiment', icon: Activity },
] as const;
type TabId = (typeof TABS)[number]['id'];

/* ─── Custom select ─────────────────────────────────────────────────────── */
interface SelectOption { value: string; label: string; sub?: string }

function Select({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white transition hover:border-white/15"
      >
        <span className="flex-1 truncate">{selected?.label ?? value}</span>
        {selected?.sub && <span className="text-[10px] text-white/25 shrink-0">{selected.sub}</span>}
        <ChevronDown size={14} className={`shrink-0 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#0e0e0e] shadow-2xl">
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.04] ${o.value === value ? 'text-white' : 'text-white/50'}`}
              >
                <span className="flex-1 truncate">{o.label}</span>
                {o.sub && <span className="text-[10px] text-white/20">{o.sub}</span>}
                {o.value === value && <Check size={12} className="shrink-0 text-white/40" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Forex data ────────────────────────────────────────────────────────── */
const FOREX_PAIRS: SelectOption[] = [
  { value: 'EUR/USD', label: 'EUR/USD', sub: '$10/pip' },
  { value: 'GBP/USD', label: 'GBP/USD', sub: '$10/pip' },
  { value: 'AUD/USD', label: 'AUD/USD', sub: '$10/pip' },
  { value: 'NZD/USD', label: 'NZD/USD', sub: '$10/pip' },
  { value: 'USD/CAD', label: 'USD/CAD', sub: '~$7.70/pip' },
  { value: 'USD/CHF', label: 'USD/CHF', sub: '~$10.2/pip' },
  { value: 'USD/JPY', label: 'USD/JPY', sub: '~$9.5/pip' },
  { value: 'EUR/JPY', label: 'EUR/JPY', sub: '~$9.5/pip' },
  { value: 'GBP/JPY', label: 'GBP/JPY', sub: '~$9.5/pip' },
  { value: 'AUD/JPY', label: 'AUD/JPY', sub: '~$9.5/pip' },
  { value: 'CHF/JPY', label: 'CHF/JPY', sub: '~$9.5/pip' },
  { value: 'EUR/GBP', label: 'EUR/GBP', sub: '~$13/pip' },
  { value: 'EUR/CHF', label: 'EUR/CHF', sub: '~$10/pip' },
  { value: 'GBP/CHF', label: 'GBP/CHF', sub: '~$10/pip' },
  { value: 'XAU/USD', label: 'XAU/USD (Gold)', sub: '$1/pip' },
  { value: 'XAG/USD', label: 'XAG/USD (Silver)', sub: '$50/pip' },
  { value: 'BTC/USD', label: 'BTC/USD', sub: '$1/pip' },
  { value: 'ETH/USD', label: 'ETH/USD', sub: '$0.1/pip' },
  { value: 'Custom', label: 'Custom instrument', sub: 'set manually' },
];

const PAIR_PIP: Record<string, number> = {
  'EUR/USD': 10, 'GBP/USD': 10, 'AUD/USD': 10, 'NZD/USD': 10,
  'USD/CAD': 7.7, 'USD/CHF': 10.2, 'USD/JPY': 9.5, 'EUR/JPY': 9.5,
  'GBP/JPY': 9.5, 'AUD/JPY': 9.5, 'CHF/JPY': 9.5, 'EUR/GBP': 13,
  'EUR/CHF': 10, 'GBP/CHF': 10, 'XAU/USD': 1, 'XAG/USD': 50,
  'BTC/USD': 1, 'ETH/USD': 0.1, Custom: 10,
};

/* ─── Futures data ──────────────────────────────────────────────────────── */
interface Contract { symbol: string; name: string; tick: number; tickVal: number; exchange: string }
const CONTRACTS: Contract[] = [
  { symbol: 'ES', name: 'E-mini S&P 500', tick: 0.25, tickVal: 12.5, exchange: 'CME' },
  { symbol: 'MES', name: 'Micro E-mini S&P 500', tick: 0.25, tickVal: 1.25, exchange: 'CME' },
  { symbol: 'NQ', name: 'E-mini Nasdaq-100', tick: 0.25, tickVal: 5, exchange: 'CME' },
  { symbol: 'MNQ', name: 'Micro E-mini Nasdaq-100', tick: 0.25, tickVal: 0.5, exchange: 'CME' },
  { symbol: 'YM', name: 'E-mini Dow ($5)', tick: 1, tickVal: 5, exchange: 'CBOT' },
  { symbol: 'MYM', name: 'Micro E-mini Dow', tick: 1, tickVal: 0.5, exchange: 'CBOT' },
  { symbol: 'RTY', name: 'E-mini Russell 2000', tick: 0.1, tickVal: 5, exchange: 'CME' },
  { symbol: 'M2K', name: 'Micro E-mini Russell 2000', tick: 0.1, tickVal: 0.5, exchange: 'CME' },
  { symbol: 'CL', name: 'Crude Oil (WTI)', tick: 0.01, tickVal: 10, exchange: 'NYMEX' },
  { symbol: 'MCL', name: 'Micro Crude Oil', tick: 0.01, tickVal: 1, exchange: 'NYMEX' },
  { symbol: 'GC', name: 'Gold', tick: 0.1, tickVal: 10, exchange: 'COMEX' },
  { symbol: 'MGC', name: 'Micro Gold', tick: 0.1, tickVal: 1, exchange: 'COMEX' },
  { symbol: 'SI', name: 'Silver', tick: 0.005, tickVal: 25, exchange: 'COMEX' },
  { symbol: 'SIL', name: 'Micro Silver', tick: 0.005, tickVal: 1.25, exchange: 'COMEX' },
  { symbol: '6E', name: 'Euro FX', tick: 0.00005, tickVal: 6.25, exchange: 'CME' },
  { symbol: '6B', name: 'British Pound', tick: 0.0001, tickVal: 6.25, exchange: 'CME' },
  { symbol: '6J', name: 'Japanese Yen', tick: 0.0000005, tickVal: 6.25, exchange: 'CME' },
  { symbol: '6A', name: 'Australian Dollar', tick: 0.0001, tickVal: 10, exchange: 'CME' },
  { symbol: '6C', name: 'Canadian Dollar', tick: 0.00005, tickVal: 5, exchange: 'CME' },
  { symbol: 'ZN', name: '10-Year T-Note', tick: 0.015625, tickVal: 15.625, exchange: 'CBOT' },
  { symbol: 'ZB', name: '30-Year T-Bond', tick: 0.03125, tickVal: 31.25, exchange: 'CBOT' },
  { symbol: 'NG', name: 'Natural Gas', tick: 0.001, tickVal: 10, exchange: 'NYMEX' },
];
const CONTRACT_OPTIONS: SelectOption[] = CONTRACTS.map((c) => ({
  value: c.symbol,
  label: `${c.symbol} — ${c.name}`,
  sub: c.exchange,
}));

/* ─── Calendar data ─────────────────────────────────────────────────────── */
interface EconEvent {
  id: string;
  title: string;
  shortTitle: string;
  startTime: string;
  date: string;
  time: string | null;
  country: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  actual: string | null;
  estimate: string | null;
  previous: string | null;
}

const IMPACT_STYLE = {
  HIGH: { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10', label: 'High' },
  MEDIUM: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Med' },
  LOW: { dot: 'bg-sky-400', text: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Low' },
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF', 'CNY'];

/* ══════════════════════════════════════════════════════════════════════════
   FOREX CALCULATOR
══════════════════════════════════════════════════════════════════════════ */
function ForexCalculator() {
  const [pair, setPair] = useState('EUR/USD');
  const [account, setAccount] = useState(10000);
  const [risk, setRisk] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [customPip, setCustomPip] = useState(10);

  const pipVal = pair === 'Custom' ? customPip : (PAIR_PIP[pair] ?? 10);
  const riskAmt = account * (risk / 100);
  const lots = stopPips > 0 && pipVal > 0 ? riskAmt / (stopPips * pipVal) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-xs">Instrument</label>
          <Select value={pair} onChange={setPair} options={FOREX_PAIRS} />
        </div>

        <div>
          <label className="label-xs">Account Balance ($)</label>
          <input type="number" value={account} onChange={(e) => setAccount(Number(e.target.value))}
            className="hub-input" min={0} />
        </div>

        <div>
          <label className="label-xs">Risk %</label>
          <input type="number" value={risk} onChange={(e) => setRisk(Number(e.target.value))}
            step={0.1} className="hub-input" min={0} max={100} />
          <div className="mt-2 flex gap-1">
            {[0.5, 1, 1.5, 2].map((v) => (
              <button key={v} onClick={() => setRisk(v)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${risk === v ? 'bg-white text-black' : 'bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/60'}`}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-xs">Stop Loss (pips)</label>
          <input type="number" value={stopPips} onChange={(e) => setStopPips(Number(e.target.value))}
            className="hub-input" min={0} />
        </div>

        {pair === 'Custom' && (
          <div>
            <label className="label-xs">Pip Value / Lot ($)</label>
            <input type="number" value={customPip} onChange={(e) => setCustomPip(Number(e.target.value))}
              step={0.01} className="hub-input" min={0} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">Position Size</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Standard Lots', val: lots.toFixed(2), bright: true },
            { label: 'Mini Lots (×10)', val: (lots * 10).toFixed(1), bright: false },
            { label: 'Micro Lots (×100)', val: Math.round(lots * 100), bright: false },
          ].map((r) => (
            <div key={r.label} className="rounded-xl bg-white/[0.03] py-3 px-2">
              <p className="text-[9px] text-white/25">{r.label}</p>
              <p className={`mt-1 font-mono text-xl font-bold ${r.bright ? 'text-white' : 'text-white/50'}`}>{r.val}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.02] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/30">Risk Amount</span>
            <span className="font-mono text-sm font-bold text-white">${riskAmt.toFixed(2)}</span>
          </div>
          <div className="rounded-lg bg-white/[0.02] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/30">Pip Value / Lot</span>
            <span className="font-mono text-sm font-bold text-white/60">${pipVal.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-[9px] text-white/20">
          Pip values are approximate for standard USD accounts.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ECONOMIC CALENDAR
══════════════════════════════════════════════════════════════════════════ */
function EconomicCalendar() {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const [events, setEvents] = useState<EconEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const [selectedDate, setSelectedDate] = useState(todayUtc);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP']);
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({
      year: String(currentMonth.getUTCFullYear()),
      month: String(currentMonth.getUTCMonth() + 1),
    });
    const ctrl = new AbortController();
    fetch(`/api/public/calendar?${q}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { if (d.data) { setEvents(d.data); setSource(d.meta?.source ?? ''); } })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [currentMonth]);

  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0)).getUTCDate();
  const startDay = monthStart.getUTCDay();

  const filteredEvents = events.filter((e) => {
    const cur = e.currency?.toUpperCase();
    const matchCur = currencies.length === 0 || currencies.includes(cur);
    const matchImp = impactFilter === 'ALL' || e.impact === impactFilter;
    return matchCur && matchImp;
  });

  function eventsForDay(day: number) {
    return filteredEvents.filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === day
        && d.getUTCMonth() === currentMonth.getUTCMonth()
        && d.getUTCFullYear() === currentMonth.getUTCFullYear();
    });
  }

  const selectedEvents = filteredEvents
    .filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === selectedDate.getUTCDate()
        && d.getUTCMonth() === selectedDate.getUTCMonth()
        && d.getUTCFullYear() === selectedDate.getUTCFullYear();
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  function toggleCurrency(cur: string) {
    setCurrencies((prev) =>
      prev.includes(cur) ? prev.filter((c) => c !== cur) : [...prev, cur]
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Currency chips */}
        <div className="flex flex-wrap gap-1.5">
          {CURRENCIES.map((cur) => (
            <button
              key={cur}
              onClick={() => toggleCurrency(cur)}
              className={`rounded-full px-3 py-1 text-xs font-mono font-semibold transition ${
                currencies.includes(cur)
                  ? 'bg-white/10 text-white ring-1 ring-white/20'
                  : 'text-white/25 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
        {/* Divider */}
        <div className="h-6 w-px bg-white/10 self-center hidden sm:block" />
        {/* Impact chips */}
        <div className="flex gap-1.5">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setImpactFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                impactFilter === f
                  ? f === 'HIGH' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                    : f === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
                    : f === 'LOW' ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30'
                    : 'bg-white/10 text-white'
                  : 'text-white/25 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              {f === 'ALL' ? 'All' : IMPACT_STYLE[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Mini calendar */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </span>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))}
                className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => { setCurrentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))); setSelectedDate(todayUtc); }}
                className="rounded-lg px-2 py-1 text-[10px] text-white/30 hover:bg-white/5 hover:text-white/60">
                Today
              </button>
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))}
                className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1.5 text-center text-[9px] font-medium text-white/20">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayUtc = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day));
              const dayEvts = eventsForDay(day);
              const isToday = dayUtc.getTime() === todayUtc.getTime();
              const isSelected = dayUtc.getTime() === selectedDate.getTime();
              const hasHigh = dayEvts.some((e) => e.impact === 'HIGH');
              const hasMed = !hasHigh && dayEvts.some((e) => e.impact === 'MEDIUM');
              const singleEvt = dayEvts.length === 1 ? dayEvts[0] : null;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dayUtc)}
                  className={`min-h-[36px] rounded-lg px-0.5 py-1 text-center transition ${
                    isSelected ? 'bg-white/10 ring-1 ring-white/20'
                    : isToday ? 'bg-white/5 ring-1 ring-white/10'
                    : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`block text-[11px] leading-none ${isSelected || isToday ? 'font-bold text-white' : 'text-white/40'}`}>
                    {day}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="mt-0.5 flex flex-col items-center gap-px">
                      {singleEvt ? (
                        <>
                          <div className={`h-1 w-1 rounded-full ${hasHigh ? 'bg-red-400' : hasMed ? 'bg-yellow-400' : 'bg-sky-400'}`} />
                          <span className={`text-[7px] font-bold leading-none truncate max-w-[28px] ${hasHigh ? 'text-red-400/70' : hasMed ? 'text-yellow-400/70' : 'text-sky-400/70'}`}>
                            {singleEvt.shortTitle?.substring(0, 5)}
                          </span>
                        </>
                      ) : (
                        <div className="flex gap-px justify-center">
                          {dayEvts.slice(0, 3).map((e, ii) => (
                            <div key={ii} className={`h-1 w-1 rounded-full ${e.impact === 'HIGH' ? 'bg-red-400' : e.impact === 'MEDIUM' ? 'bg-yellow-400' : 'bg-sky-400'}`} />
                          ))}
                          {dayEvts.length > 3 && <span className="text-[7px] text-white/20 ml-px">+{dayEvts.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-[9px] text-white/20">
            {source === 'finnhub' ? 'Full month · Finnhub' : 'This week + next · Forex Factory'} · All times UTC
          </p>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/40">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
            <span className="ml-2 text-white/20">({selectedEvents.length})</span>
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
            </div>
          ) : selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <Calendar size={24} className="text-white/10" />
              <p className="mt-2 text-xs text-white/20">No events</p>
            </div>
          ) : (
            selectedEvents.map((e) => {
              const imp = e.impact ? IMPACT_STYLE[e.impact] : null;
              return (
                <div key={e.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-start gap-2">
                    {imp && <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${imp.dot}`} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 leading-tight">{e.shortTitle}</p>
                      <p className="text-[10px] text-white/35 truncate">{e.title}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-white/40 shrink-0">{e.currency}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-white/25">
                      {e.time ? `${e.time} UTC` : 'All day'}
                    </span>
                    {(e.actual || e.estimate || e.previous) && (
                      <div className="flex gap-2 text-[9px]">
                        {e.actual && <span className="text-green-400">A: {e.actual}</span>}
                        {e.estimate && <span className="text-white/30">F: {e.estimate}</span>}
                        {e.previous && <span className="text-white/20">P: {e.previous}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FUTURES SCALE
══════════════════════════════════════════════════════════════════════════ */
function FuturesScale() {
  const [symbol, setSymbol] = useState('ES');
  const [account, setAccount] = useState(25000);
  const [dollarRisk, setDollarRisk] = useState(500);
  const [stopTicks, setStopTicks] = useState(8);

  const contract = CONTRACTS.find((c) => c.symbol === symbol) ?? CONTRACTS[0];
  const riskPct = account > 0 ? (dollarRisk / account) * 100 : 0;
  const contracts = stopTicks > 0 && contract.tickVal > 0
    ? Math.floor(dollarRisk / (stopTicks * contract.tickVal))
    : 0;
  const actualRisk = contracts * stopTicks * contract.tickVal;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-xs">Contract</label>
          <Select value={symbol} onChange={setSymbol} options={CONTRACT_OPTIONS} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/30">
            <span>Tick size: {contract.tick}</span>
            <span>Tick value: ${contract.tickVal}</span>
            <span>Exchange: {contract.exchange}</span>
          </div>
        </div>

        <div>
          <label className="label-xs">Account Size ($)</label>
          <input type="number" value={account} onChange={(e) => setAccount(Number(e.target.value))}
            className="hub-input" min={0} />
        </div>

        <div>
          <label className="label-xs">Dollar Risk ($)</label>
          <input type="number" value={dollarRisk} onChange={(e) => setDollarRisk(Number(e.target.value))}
            className="hub-input" min={0} />
          <p className="mt-1 text-[10px] text-white/25">{riskPct.toFixed(2)}% of account</p>
        </div>

        <div>
          <label className="label-xs">Stop Loss (ticks)</label>
          <input type="number" value={stopTicks} onChange={(e) => setStopTicks(Number(e.target.value))}
            className="hub-input" min={1} />
          <p className="mt-1 text-[10px] text-white/25">{(stopTicks * contract.tick).toFixed(4)} points</p>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">Position Size</p>
        <p className="text-center font-mono text-6xl font-black text-white">{contracts}</p>
        <p className="mt-1 text-center text-sm text-white/40">contract{contracts !== 1 ? 's' : ''}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
            <p className="text-[9px] text-white/25">Actual Risk</p>
            <p className="font-mono text-sm font-bold text-white">${actualRisk.toFixed(0)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
            <p className="text-[9px] text-white/25">{stopTicks} ticks × ${contract.tickVal}</p>
            <p className="font-mono text-sm font-bold text-white/60">${(stopTicks * contract.tickVal).toFixed(2)}/contract</p>
          </div>
        </div>
        {contracts === 0 && stopTicks > 0 && (
          <p className="mt-3 text-center text-xs text-red-400/60">Dollar risk too small for 1 contract at this stop</p>
        )}
      </div>

      {/* Quick reference */}
      <div className="overflow-hidden rounded-xl border border-white/5">
        <div className="border-b border-white/5 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Quick Reference — click to select</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Symbol', 'Name', 'Tick', 'Tick $', 'Exch.'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-white/20">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((c) => (
                <tr
                  key={c.symbol}
                  onClick={() => setSymbol(c.symbol)}
                  className={`cursor-pointer border-b border-white/[0.03] transition hover:bg-white/[0.03] ${symbol === c.symbol ? 'bg-white/[0.05]' : ''}`}
                >
                  <td className="px-3 py-2 font-mono font-bold text-white/80">{c.symbol}</td>
                  <td className="px-3 py-2 text-white/40 max-w-[140px] truncate">{c.name}</td>
                  <td className="px-3 py-2 text-white/30">{c.tick}</td>
                  <td className="px-3 py-2 text-white/40">${c.tickVal}</td>
                  <td className="px-3 py-2 text-white/20">{c.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MARKET SENTIMENT
══════════════════════════════════════════════════════════════════════════ */
const ASSETS = ['Crypto', 'Stocks', 'Forex', 'Gold'] as const;
type Asset = (typeof ASSETS)[number];

interface FngData { value: string; value_classification: string; timestamp: string }

function SentimentGauge({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 75 ? '#4ade80' : pct >= 55 ? '#34d399' : pct >= 45 ? '#facc15' : pct >= 25 ? '#fb923c' : '#f87171';
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function CryptoSentiment() {
  const [fng, setFng] = useState<FngData | null>(null);
  const [history, setHistory] = useState<FngData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch('https://api.alternative.me/fng/?limit=7')
      .then((r) => r.json())
      .then((d) => { if (d.data?.length) { setFng(d.data[0]); setHistory(d.data); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const score = fng ? Number(fng.value) : 0;
  const getColor = (s: number) => s >= 75 ? 'text-green-400' : s >= 55 ? 'text-emerald-400' : s >= 45 ? 'text-yellow-400' : s >= 25 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white/40">Crypto Fear &amp; Greed</p>
          <p className="text-[10px] text-white/20">Source: alternative.me</p>
        </div>
        <button onClick={load} className="rounded-lg p-2 text-white/20 hover:bg-white/5 hover:text-white/50 transition">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-white/5" />
      ) : fng ? (
        <>
          <div className="flex items-end gap-4">
            <p className={`font-mono text-6xl font-black ${getColor(score)}`}>{fng.value}</p>
            <div className="pb-1">
              <p className={`text-xl font-bold ${getColor(score)}`}>{fng.value_classification}</p>
              <p className="text-[10px] text-white/25">
                {new Date(Number(fng.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <SentimentGauge score={score} />
          <div className="flex justify-between text-[9px] text-white/20">
            <span>Extreme Fear (0)</span>
            <span>Neutral (50)</span>
            <span>Extreme Greed (100)</span>
          </div>

          {/* 7-day history */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/25">7-Day History</p>
            <div className="space-y-1.5">
              {history.slice(0, 7).map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 text-[10px] text-white/25">
                    {i === 0 ? 'Today' : new Date(Number(h.timestamp) * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex-1">
                    <SentimentGauge score={Number(h.value)} />
                  </div>
                  <span className={`w-16 text-right text-[10px] font-mono font-bold ${getColor(Number(h.value))}`}>
                    {h.value} {h.value_classification.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-white/30">Failed to load. Check your connection.</p>
      )}
    </div>
  );
}

function ResourceCard({ title, url, desc }: { title: string; url: string; desc: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10 hover:bg-white/[0.04]">
      <p className="text-sm font-medium text-white/70">{title} ↗</p>
      <p className="mt-0.5 text-xs text-white/35">{desc}</p>
    </a>
  );
}

function StocksSentiment() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40">Real-time stock market sentiment — use these resources:</p>
      <ResourceCard title="CNN Fear & Greed Index" url="https://money.cnn.com/data/fear-and-greed/" desc="Composite index: momentum, put/call ratio, breadth, VIX, junk bonds, safe haven demand" />
      <ResourceCard title="CBOE VIX (Volatility Index)" url="https://www.cboe.com/tradable_products/vix/" desc="Market's expectation of 30-day volatility — above 30 = fear, below 20 = complacency" />
      <ResourceCard title="Barchart Market Overview" url="https://www.barchart.com/stocks/market-performance/market-overview" desc="Advance/decline, new highs/lows, sector performance" />
      <ResourceCard title="Fear & Greed Lab" url="https://fearandgreedlab.com/" desc="Extended sentiment tracking for US equities" />
    </div>
  );
}

function ForexSentiment() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40">Forex positioning, COT data, and order book resources:</p>
      <ResourceCard title="Myfxbook Community Outlook" url="https://www.myfxbook.com/community/outlook" desc="Retail trader positioning across major pairs — contrarian signal" />
      <ResourceCard title="CFTC Commitments of Traders" url="https://www.cftc.gov/dea/futures/deahistfo.htm" desc="Weekly COT report — commercial vs. speculative positioning in futures" />
      <ResourceCard title="Forex Factory Calendar" url="https://www.forexfactory.com/calendar" desc="High-impact news, market sentiment, forecasts" />
      <ResourceCard title="DXY (Dollar Index) — TradingView" url="https://www.tradingview.com/chart/?symbol=TVC%3ADXY" desc="US Dollar strength index — benchmark for all major USD pairs" />
    </div>
  );
}

function GoldSentiment() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40">Gold (XAU) positioning and sentiment resources:</p>
      <ResourceCard title="Gold COT Report — CFTC" url="https://www.cftc.gov/dea/futures/deahistfo.htm" desc="Managed money long/short positions in COMEX gold futures" />
      <ResourceCard title="World Gold Council" url="https://www.gold.org/goldhub/data/gold-prices" desc="Demand drivers, ETF holdings, central bank reserve data" />
      <ResourceCard title="GDX (Gold Miners ETF)" url="https://www.tradingview.com/chart/?symbol=AMEX%3AGDX" desc="Miners often lead spot gold — useful leading indicator" />
      <ResourceCard title="FRED: Gold Price" url="https://fred.stlouisfed.org/series/GOLDAMGBD228NLBM" desc="Federal Reserve historical gold price data going back decades" />
    </div>
  );
}

function MarketSentiment() {
  const [asset, setAsset] = useState<Asset>('Crypto');

  return (
    <div className="space-y-5">
      {/* Asset selector */}
      <div className="flex flex-wrap gap-2">
        {ASSETS.map((a) => (
          <button
            key={a}
            onClick={() => setAsset(a)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              asset === a ? 'bg-white text-black' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06] hover:text-white/60'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {asset === 'Crypto' && <CryptoSentiment />}
      {asset === 'Stocks' && <StocksSentiment />}
      {asset === 'Forex' && <ForexSentiment />}
      {asset === 'Gold' && <GoldSentiment />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════════════ */
export function TradingHub() {
  const [tab, setTab] = useState<TabId>('forex');

  return (
    <>
      {/* Utility classes referenced via @apply would be ideal; inline here for portability */}
      <style>{`
        .label-xs { display: block; margin-bottom: 6px; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        .hub-input { width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.03); padding: 12px 16px; font-size: 14px; color: white; outline: none; transition: border-color 0.15s; }
        .hub-input:focus { border-color: rgba(255,255,255,0.20); }
      `}</style>

      <div className="rounded-2xl border border-white/5 bg-white/[0.015] overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-white/5 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-shrink-0 items-center gap-2 px-5 py-4 text-sm font-medium transition border-b-2 ${
                  active ? 'border-white text-white' : 'border-transparent text-white/30 hover:text-white/60 hover:border-white/20'
                }`}
              >
                <Icon size={14} />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {tab === 'forex' && <ForexCalculator />}
          {tab === 'calendar' && <EconomicCalendar />}
          {tab === 'futures' && <FuturesScale />}
          {tab === 'sentiment' && <MarketSentiment />}
        </div>
      </div>
    </>
  );
}
