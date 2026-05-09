'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Calculator, Calendar, BarChart2, Activity,
  ChevronLeft, ChevronRight, ChevronDown, Check,
} from 'lucide-react';
import { MarketSentiment } from './market-sentiment';

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
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-left text-sm text-white transition hover:border-white/35 focus:border-white/50 focus:outline-none"
      >
        <span className="flex-1 truncate">{selected?.label ?? value}</span>
        {selected?.sub && <span className="text-[10px] text-white/35 shrink-0">{selected.sub}</span>}
        <ChevronDown size={14} className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-white/20 bg-[#0e0e0e] shadow-2xl">
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${o.value === value ? 'text-white' : 'text-white/50'}`}
              >
                <span className="flex-1 truncate">{o.label}</span>
                {o.sub && <span className="text-[10px] text-white/25">{o.sub}</span>}
                {o.value === value && <Check size={12} className="shrink-0 text-white/60" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Numeric input ─────────────────────────────────────────────────────── */
// type="number" blocks select() in Chrome; type="text" + inputMode fixes it.
function NumInput({ value, onChange, step, min, className }: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  className?: string;
}) {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        const n = parseFloat(e.target.value);
        if (!isNaN(n) && (min === undefined || n >= min)) onChange(n);
      }}
      onFocus={(e) => e.target.select()}
      onBlur={() => {
        const n = parseFloat(raw);
        if (isNaN(n)) {
          setRaw(String(value));
        } else {
          setRaw(String(n));
          onChange(n);
        }
      }}
      className={className}
    />
  );
}

/* ─── Toggle Switch ─────────────────────────────────────────────────────── */
function ToggleSwitch({ left, right, value, onChange }: {
  left: string; right: string; value: 'left' | 'right';
  onChange: (v: 'left' | 'right') => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-xs font-semibold transition ${value === 'left' ? 'text-white' : 'text-white/35'}`}>{left}</span>
      <button
        type="button"
        aria-label="toggle mode"
        onClick={() => onChange(value === 'left' ? 'right' : 'left')}
        className={`relative h-6 w-11 rounded-full border transition-all ${
          value === 'right' ? 'border-white/50 bg-white/25' : 'border-white/25 bg-white/[0.07]'
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
          value === 'right' ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
      <span className={`text-xs font-semibold transition ${value === 'right' ? 'text-white' : 'text-white/35'}`}>{right}</span>
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

const PAIR_PIP_SIZE: Record<string, number> = {
  'EUR/USD': 0.0001, 'GBP/USD': 0.0001, 'AUD/USD': 0.0001, 'NZD/USD': 0.0001,
  'USD/CAD': 0.0001, 'USD/CHF': 0.0001, 'USD/JPY': 0.01, 'EUR/JPY': 0.01,
  'GBP/JPY': 0.01, 'AUD/JPY': 0.01, 'CHF/JPY': 0.01, 'EUR/GBP': 0.0001,
  'EUR/CHF': 0.0001, 'GBP/CHF': 0.0001, 'XAU/USD': 0.01, 'XAG/USD': 0.001,
  'BTC/USD': 1, 'ETH/USD': 0.01, Custom: 0.0001,
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
  const [tpPips, setTpPips] = useState(40);
  const [customPip, setCustomPip] = useState(10);
  const [mode, setMode] = useState<'left' | 'right'>('left'); // left = Pips, right = Price
  const [entryPrice, setEntryPrice] = useState(1.1000);
  const [slPrice, setSlPrice] = useState(1.0980);

  const pipVal = pair === 'Custom' ? customPip : (PAIR_PIP[pair] ?? 10);
  const pipSize = PAIR_PIP_SIZE[pair] ?? 0.0001;

  // In price mode, derive stopPips from entry/sl
  const derivedStopPips = mode === 'right'
    ? Math.abs(entryPrice - slPrice) / pipSize
    : stopPips;

  const isLong = mode === 'right' ? slPrice < entryPrice : true;
  const tpPriceCalc = mode === 'right'
    ? isLong
      ? entryPrice + tpPips * pipSize
      : entryPrice - tpPips * pipSize
    : null;

  const activeSL = mode === 'right' ? derivedStopPips : stopPips;
  const riskAmt = account * (risk / 100);
  const lots = activeSL > 0 && pipVal > 0 ? riskAmt / (activeSL * pipVal) : 0;
  const tpAmt = tpPips > 0 ? lots * tpPips * pipVal : 0;
  const rr = activeSL > 0 && tpPips > 0 ? tpPips / activeSL : 0;

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Input Mode</p>
        <ToggleSwitch left="Pips" right="Price" value={mode} onChange={setMode} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-xs">Instrument</label>
          <Select value={pair} onChange={setPair} options={FOREX_PAIRS} />
        </div>

        <div>
          <label className="label-xs">Account Balance ($)</label>
          <NumInput value={account} onChange={setAccount} min={0} className="hub-input" />
        </div>

        <div>
          <label className="label-xs">Risk %</label>
          <NumInput value={risk} onChange={setRisk} min={0} className="hub-input" />
          <div className="mt-2 flex gap-1">
            {[0.5, 1, 1.5, 2].map((v) => (
              <button key={v} onClick={() => setRisk(v)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${risk === v ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        {mode === 'left' ? (
          <>
            <div>
              <label className="label-xs">Stop Loss (pips)</label>
              <NumInput value={stopPips} onChange={setStopPips} min={0} className="hub-input" />
            </div>
            <div>
              <label className="label-xs">Take Profit (pips)</label>
              <NumInput value={tpPips} onChange={setTpPips} min={0} className="hub-input" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="label-xs">Entry Price</label>
              <NumInput value={entryPrice} onChange={setEntryPrice} min={0} className="hub-input" />
            </div>
            <div>
              <label className="label-xs">Stop Loss Price</label>
              <NumInput value={slPrice} onChange={setSlPrice} min={0} className="hub-input" />
              <p className="mt-1 text-[10px] text-white/40">
                = {derivedStopPips.toFixed(1)} pips · {isLong ? 'Long' : 'Short'}
              </p>
            </div>
            <div>
              <label className="label-xs">Take Profit (pips)</label>
              <NumInput value={tpPips} onChange={setTpPips} min={0} className="hub-input" />
              {tpPriceCalc !== null && (
                <p className="mt-1 text-[10px] text-white/40">
                  TP price ≈ {tpPriceCalc.toFixed(pair.includes('JPY') ? 3 : 5)}
                </p>
              )}
            </div>
          </>
        )}

        {pair === 'Custom' && (
          <div>
            <label className="label-xs">Pip Value / Lot ($)</label>
            <NumInput value={customPip} onChange={setCustomPip} min={0} className="hub-input" />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-5">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/35">Position Size</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Standard Lots', val: lots.toFixed(2), bright: true },
            { label: 'Mini Lots (×10)', val: (lots * 10).toFixed(1), bright: false },
            { label: 'Micro Lots (×100)', val: Math.round(lots * 100), bright: false },
          ].map((r) => (
            <div key={r.label} className="rounded-xl border border-white/10 bg-white/[0.04] py-3 px-2">
              <p className="text-[9px] text-white/35">{r.label}</p>
              <p className={`mt-1 font-mono text-xl font-bold ${r.bright ? 'text-white' : 'text-white/55'}`}>{r.val}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/40">Risk Amount</span>
            <span className="font-mono text-sm font-bold text-white">${riskAmt.toFixed(2)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/40">Pip Value / Lot</span>
            <span className="font-mono text-sm font-bold text-white/65">${pipVal.toFixed(2)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/40">TP Profit</span>
            <span className="font-mono text-sm font-bold text-green-400">${tpAmt.toFixed(2)}</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 flex justify-between items-center">
            <span className="text-[10px] text-white/40">R : R Ratio</span>
            <span className={`font-mono text-sm font-bold ${rr >= 2 ? 'text-green-400' : rr >= 1 ? 'text-yellow-400' : 'text-red-400/80'}`}>
              1 : {rr.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-[9px] text-white/25">
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
    setEvents([]);
    const q = new URLSearchParams({
      year: String(currentMonth.getUTCFullYear()),
      month: String(currentMonth.getUTCMonth() + 1),
    });
    const ctrl = new AbortController();
    fetch(`/api/public/calendar?${q}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) { setEvents(d.data); setSource(d.meta?.source ?? ''); }
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setLoading(false);
      });
    return () => ctrl.abort();
  }, [currentMonth]);

  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0)).getUTCDate();
  const startDay = monthStart.getUTCDay();

  const filteredEvents = useMemo(() =>
    events.filter((e) => {
      const cur = (e.currency ?? '').toUpperCase();
      const matchCur = currencies.length === 0 || currencies.includes(cur);
      const matchImp = impactFilter === 'ALL' || e.impact === impactFilter;
      return matchCur && matchImp;
    }),
    [events, currencies, impactFilter]
  );

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const selectedEvents = useMemo(() =>
    filteredEvents
      .filter((e) => e.date === selectedDateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [filteredEvents, selectedDateStr]
  );

  const eventsForDay = useCallback((day: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${currentMonth.getUTCFullYear()}-${pad(currentMonth.getUTCMonth() + 1)}-${pad(day)}`;
    return filteredEvents.filter((e) => e.date === dateStr);
  }, [filteredEvents, currentMonth]);

  function toggleCurrency(cur: string) {
    setCurrencies((prev) =>
      prev.includes(cur) ? prev.filter((c) => c !== cur) : [...prev, cur]
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CURRENCIES.map((cur) => (
            <button
              key={cur}
              onClick={() => toggleCurrency(cur)}
              className={`rounded-full px-3 py-1 text-xs font-mono font-semibold transition ${
                currencies.includes(cur)
                  ? 'bg-white/15 text-white ring-1 ring-white/35'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-white/10 self-center hidden sm:block" />
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
                  : 'text-white/30 hover:text-white/55 hover:bg-white/5'
              }`}
            >
              {f === 'ALL' ? 'All' : IMPACT_STYLE[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-heading text-xl font-bold text-white sm:text-2xl">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))}
                className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white/80">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => { setCurrentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))); setSelectedDate(todayUtc); }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white/85">
                Today
              </button>
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))}
                className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white/80">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 border-b border-white/5 pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/40">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="min-h-[80px]" />)}
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
                  className={`flex min-h-[80px] flex-col items-stretch rounded-xl border px-2 py-2 text-left transition sm:min-h-[96px] ${
                    isSelected ? 'border-white/30 bg-white/[0.10]'
                    : isToday ? 'border-white/20 bg-white/[0.05]'
                    : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-sm leading-none ${isSelected || isToday ? 'font-bold text-white' : 'font-semibold text-white/55'}`}>
                    {day}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="mt-2 flex flex-1 flex-col gap-1 overflow-hidden">
                      {singleEvt ? (
                        <div className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-[10px] font-medium ${
                          hasHigh ? 'bg-red-500/15 text-red-300'
                          : hasMed ? 'bg-yellow-500/15 text-yellow-300'
                          : 'bg-sky-500/15 text-sky-300'
                        }`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${hasHigh ? 'bg-red-400' : hasMed ? 'bg-yellow-400' : 'bg-sky-400'}`} />
                          <span className="truncate">{singleEvt.shortTitle?.substring(0, 12)}</span>
                        </div>
                      ) : (
                        <>
                          {dayEvts.slice(0, 2).map((e, ii) => (
                            <div key={ii} className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 text-[9px] font-medium ${
                              e.impact === 'HIGH' ? 'bg-red-500/15 text-red-300'
                              : e.impact === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-300'
                              : 'bg-sky-500/15 text-sky-300'
                            }`}>
                              <span className={`h-1 w-1 shrink-0 rounded-full ${e.impact === 'HIGH' ? 'bg-red-400' : e.impact === 'MEDIUM' ? 'bg-yellow-400' : 'bg-sky-400'}`} />
                              <span className="truncate">{e.shortTitle?.substring(0, 10) || e.currency}</span>
                            </div>
                          ))}
                          {dayEvts.length > 2 && (
                            <span className="text-[9px] font-semibold text-white/45">+{dayEvts.length - 2} more</span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[10px] text-white/30">
            {source === 'finnhub' ? 'Full month · Finnhub' : 'This week + next · Forex Factory'} · All times UTC
          </p>
        </div>

        <div key={`${selectedDateStr}-${currencies.join(',')}-${impactFilter}`} className="space-y-2">
          <p className="text-xs font-medium text-white/50">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
            <span className="ml-2 text-white/25">({selectedEvents.length})</span>
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
            </div>
          ) : selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <Calendar size={24} className="text-white/15" />
              <p className="mt-2 text-xs text-white/25">No events</p>
            </div>
          ) : (
            selectedEvents.map((e) => {
              const imp = e.impact ? IMPACT_STYLE[e.impact] : null;
              return (
                <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    {imp && <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${imp.dot}`} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/90 leading-tight">{e.shortTitle}</p>
                      <p className="text-[10px] text-white/40 truncate">{e.title}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-white/50 shrink-0">{e.currency}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-white/30">
                      {e.time ? `${e.time} UTC` : 'All day'}
                    </span>
                    {(e.actual || e.estimate || e.previous) && (
                      <div className="flex gap-2 text-[9px]">
                        {e.actual && <span className="text-green-400">A: {e.actual}</span>}
                        {e.estimate && <span className="text-white/35">F: {e.estimate}</span>}
                        {e.previous && <span className="text-white/25">P: {e.previous}</span>}
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
  const [tpTicks, setTpTicks] = useState(16);
  const [mode, setMode] = useState<'left' | 'right'>('left'); // left = Ticks, right = Price
  const [entryPrice, setEntryPrice] = useState(5000);
  const [slPrice, setSlPrice] = useState(4998);

  const contract = CONTRACTS.find((c) => c.symbol === symbol) ?? CONTRACTS[0];
  const riskPct = account > 0 ? (dollarRisk / account) * 100 : 0;

  const derivedStopTicks = mode === 'right'
    ? Math.round(Math.abs(entryPrice - slPrice) / contract.tick)
    : stopTicks;

  const isLong = mode === 'right' ? slPrice < entryPrice : true;
  const tpPriceCalc = mode === 'right'
    ? isLong
      ? entryPrice + tpTicks * contract.tick
      : entryPrice - tpTicks * contract.tick
    : null;

  const activeSL = mode === 'right' ? derivedStopTicks : stopTicks;
  const contracts = activeSL > 0 && contract.tickVal > 0
    ? Math.floor(dollarRisk / (activeSL * contract.tickVal))
    : 0;
  const actualRisk = contracts * activeSL * contract.tickVal;
  const tpAmt = contracts * tpTicks * contract.tickVal;
  const rr = activeSL > 0 && tpTicks > 0 ? tpTicks / activeSL : 0;

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Input Mode</p>
        <ToggleSwitch left="Ticks" right="Price" value={mode} onChange={setMode} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-xs">Contract</label>
          <Select value={symbol} onChange={setSymbol} options={CONTRACT_OPTIONS} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40">
            <span>Tick size: {contract.tick}</span>
            <span>Tick value: ${contract.tickVal}</span>
            <span>Exchange: {contract.exchange}</span>
          </div>
        </div>

        <div>
          <label className="label-xs">Account Size ($)</label>
          <NumInput value={account} onChange={setAccount} min={0} className="hub-input" />
        </div>

        <div>
          <label className="label-xs">Dollar Risk ($)</label>
          <NumInput value={dollarRisk} onChange={setDollarRisk} min={0} className="hub-input" />
          <p className="mt-1 text-[10px] text-white/40">{riskPct.toFixed(2)}% of account</p>
        </div>

        {mode === 'left' ? (
          <>
            <div>
              <label className="label-xs">Stop Loss (ticks)</label>
              <NumInput value={stopTicks} onChange={setStopTicks} min={1} className="hub-input" />
              <p className="mt-1 text-[10px] text-white/40">{(stopTicks * contract.tick).toFixed(4)} points</p>
            </div>
            <div>
              <label className="label-xs">Take Profit (ticks)</label>
              <NumInput value={tpTicks} onChange={setTpTicks} min={0} className="hub-input" />
              <p className="mt-1 text-[10px] text-white/40">{(tpTicks * contract.tick).toFixed(4)} points</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="label-xs">Entry Price</label>
              <NumInput value={entryPrice} onChange={setEntryPrice} min={0} className="hub-input" />
            </div>
            <div>
              <label className="label-xs">Stop Loss Price</label>
              <NumInput value={slPrice} onChange={setSlPrice} min={0} className="hub-input" />
              <p className="mt-1 text-[10px] text-white/40">
                = {derivedStopTicks} ticks · {isLong ? 'Long' : 'Short'}
              </p>
            </div>
            <div>
              <label className="label-xs">Take Profit (ticks)</label>
              <NumInput value={tpTicks} onChange={setTpTicks} min={0} className="hub-input" />
              {tpPriceCalc !== null && (
                <p className="mt-1 text-[10px] text-white/40">
                  TP price ≈ {tpPriceCalc.toFixed(2)}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Result */}
      <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">Position Size</p>
        <p className="text-center font-mono text-6xl font-black text-white">{contracts}</p>
        <p className="mt-1 text-center text-sm text-white/50">contract{contracts !== 1 ? 's' : ''}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="text-[9px] text-white/35">Actual Risk</p>
            <p className="font-mono text-sm font-bold text-white">${actualRisk.toFixed(0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="text-[9px] text-white/35">{activeSL} ticks × ${contract.tickVal}</p>
            <p className="font-mono text-sm font-bold text-white/65">${(activeSL * contract.tickVal).toFixed(2)}/contract</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="text-[9px] text-white/35">TP Profit</p>
            <p className="font-mono text-sm font-bold text-green-400">${tpAmt.toFixed(0)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <p className="text-[9px] text-white/35">R : R Ratio</p>
            <p className={`font-mono text-sm font-bold ${rr >= 2 ? 'text-green-400' : rr >= 1 ? 'text-yellow-400' : 'text-red-400/80'}`}>
              1 : {rr.toFixed(2)}
            </p>
          </div>
        </div>
        {contracts === 0 && activeSL > 0 && (
          <p className="mt-3 text-center text-xs text-red-400/60">Dollar risk too small for 1 contract at this stop</p>
        )}
      </div>

      {/* Quick reference */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="border-b border-white/10 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Quick Reference — click to select</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Symbol', 'Name', 'Tick', 'Tick $', 'Exch.'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((c) => (
                <tr
                  key={c.symbol}
                  onClick={() => setSymbol(c.symbol)}
                  className={`cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.04] ${symbol === c.symbol ? 'bg-white/[0.07]' : ''}`}
                >
                  <td className="px-3 py-2 font-mono font-bold text-white">{c.symbol}</td>
                  <td className="px-3 py-2 text-white/50 max-w-[140px] truncate">{c.name}</td>
                  <td className="px-3 py-2 text-white/40">{c.tick}</td>
                  <td className="px-3 py-2 text-white/50">${c.tickVal}</td>
                  <td className="px-3 py-2 text-white/30">{c.exchange}</td>
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
   MAIN
══════════════════════════════════════════════════════════════════════════ */
export function TradingHub() {
  const [tab, setTab] = useState<TabId>('forex');

  return (
    <>
      <style>{`
        .label-xs {
          display: block; margin-bottom: 6px; font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.50);
        }
        .hub-input {
          width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.20);
          background: rgba(255,255,255,0.04); padding: 12px 16px; font-size: 14px;
          color: white; outline: none; transition: border-color 0.15s, background 0.15s;
        }
        .hub-input:hover { border-color: rgba(255,255,255,0.30); }
        .hub-input:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.06); }
      `}</style>

      <div className="rounded-2xl border border-white/10 bg-white/[0.015] overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-white/10 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-shrink-0 items-center gap-2 px-5 py-4 text-sm font-medium transition border-b-2 ${
                  active ? 'border-white text-white' : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/25'
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
