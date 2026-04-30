'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator, Calendar, BarChart2, Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

/* ─── Tab metadata ─────────────────────────────────────────────────────── */
const TABS = [
  { id: 'forex', label: 'Forex Calculator', icon: Calculator },
  { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
  { id: 'futures', label: 'Futures Scale', icon: BarChart2 },
  { id: 'sentiment', label: 'Market Sentiment', icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ─── Forex pairs ──────────────────────────────────────────────────────── */
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', pipValue: 10, note: 'Major' },
  { symbol: 'GBP/USD', pipValue: 10, note: 'Major' },
  { symbol: 'AUD/USD', pipValue: 10, note: 'Major' },
  { symbol: 'NZD/USD', pipValue: 10, note: 'Major' },
  { symbol: 'USD/CAD', pipValue: 7.7, note: 'Major' },
  { symbol: 'USD/CHF', pipValue: 10.2, note: 'Major' },
  { symbol: 'USD/JPY', pipValue: 9.5, note: 'Major · pip=0.01' },
  { symbol: 'EUR/JPY', pipValue: 9.5, note: 'Cross · pip=0.01' },
  { symbol: 'GBP/JPY', pipValue: 9.5, note: 'Cross · pip=0.01' },
  { symbol: 'AUD/JPY', pipValue: 9.5, note: 'Cross · pip=0.01' },
  { symbol: 'CHF/JPY', pipValue: 9.5, note: 'Cross · pip=0.01' },
  { symbol: 'EUR/GBP', pipValue: 13, note: 'Cross' },
  { symbol: 'EUR/CHF', pipValue: 10, note: 'Cross' },
  { symbol: 'GBP/CHF', pipValue: 10, note: 'Cross' },
  { symbol: 'XAU/USD', pipValue: 1, note: 'Gold · pip=0.01' },
  { symbol: 'XAG/USD', pipValue: 50, note: 'Silver' },
  { symbol: 'BTC/USD', pipValue: 1, note: 'Crypto · pip=$1' },
  { symbol: 'ETH/USD', pipValue: 0.1, note: 'Crypto · pip=$0.1' },
  { symbol: 'Custom', pipValue: 10, note: 'Enter manually' },
];

/* ─── Futures contracts ────────────────────────────────────────────────── */
const FUTURES_CONTRACTS = [
  { symbol: 'ES', name: 'E-mini S&P 500', tickSize: 0.25, tickValue: 12.5, exchange: 'CME' },
  { symbol: 'MES', name: 'Micro E-mini S&P 500', tickSize: 0.25, tickValue: 1.25, exchange: 'CME' },
  { symbol: 'NQ', name: 'E-mini Nasdaq-100', tickSize: 0.25, tickValue: 5, exchange: 'CME' },
  { symbol: 'MNQ', name: 'Micro E-mini Nasdaq-100', tickSize: 0.25, tickValue: 0.5, exchange: 'CME' },
  { symbol: 'YM', name: 'E-mini Dow ($5)', tickSize: 1, tickValue: 5, exchange: 'CBOT' },
  { symbol: 'MYM', name: 'Micro E-mini Dow', tickSize: 1, tickValue: 0.5, exchange: 'CBOT' },
  { symbol: 'RTY', name: 'E-mini Russell 2000', tickSize: 0.1, tickValue: 5, exchange: 'CME' },
  { symbol: 'M2K', name: 'Micro E-mini Russell 2000', tickSize: 0.1, tickValue: 0.5, exchange: 'CME' },
  { symbol: 'CL', name: 'Crude Oil (WTI)', tickSize: 0.01, tickValue: 10, exchange: 'NYMEX' },
  { symbol: 'MCL', name: 'Micro Crude Oil', tickSize: 0.01, tickValue: 1, exchange: 'NYMEX' },
  { symbol: 'GC', name: 'Gold', tickSize: 0.1, tickValue: 10, exchange: 'COMEX' },
  { symbol: 'MGC', name: 'Micro Gold', tickSize: 0.1, tickValue: 1, exchange: 'COMEX' },
  { symbol: 'SI', name: 'Silver', tickSize: 0.005, tickValue: 25, exchange: 'COMEX' },
  { symbol: 'SIL', name: 'Micro Silver', tickSize: 0.005, tickValue: 1.25, exchange: 'COMEX' },
  { symbol: '6E', name: 'Euro FX', tickSize: 0.00005, tickValue: 6.25, exchange: 'CME' },
  { symbol: '6B', name: 'British Pound', tickSize: 0.0001, tickValue: 6.25, exchange: 'CME' },
  { symbol: '6J', name: 'Japanese Yen', tickSize: 0.0000005, tickValue: 6.25, exchange: 'CME' },
  { symbol: '6A', name: 'Australian Dollar', tickSize: 0.0001, tickValue: 10, exchange: 'CME' },
  { symbol: 'ZN', name: '10-Year T-Note', tickSize: 0.015625, tickValue: 15.625, exchange: 'CBOT' },
  { symbol: 'ZB', name: '30-Year T-Bond', tickSize: 0.03125, tickValue: 31.25, exchange: 'CBOT' },
  { symbol: 'NG', name: 'Natural Gas', tickSize: 0.001, tickValue: 10, exchange: 'NYMEX' },
];

/* ─── Calendar event types ─────────────────────────────────────────────── */
const IMPACT_STYLES = {
  HIGH: { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10', label: 'High' },
  MEDIUM: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Med' },
  LOW: { dot: 'bg-sky-400', text: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Low' },
};

interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  country?: string;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Sub-components                                                         */
/* ═══════════════════════════════════════════════════════════════════════ */

function ForexCalculator() {
  const [account, setAccount] = useState(10000);
  const [risk, setRisk] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pair, setPair] = useState(FOREX_PAIRS[0]);
  const [customPipValue, setCustomPipValue] = useState(10);

  const pipValue = pair.symbol === 'Custom' ? customPipValue : pair.pipValue;
  const riskAmount = account * (risk / 100);
  const lots = stopPips > 0 && pipValue > 0 ? riskAmount / (stopPips * pipValue) : 0;
  const miniLots = lots * 10;
  const microLots = lots * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pair */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Instrument</label>
          <select
            value={pair.symbol}
            onChange={(e) => setPair(FOREX_PAIRS.find((p) => p.symbol === e.target.value) ?? FOREX_PAIRS[0])}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20 appearance-none"
          >
            {FOREX_PAIRS.map((p) => (
              <option key={p.symbol} value={p.symbol} className="bg-neutral-900">
                {p.symbol} — {p.note}
              </option>
            ))}
          </select>
        </div>

        {/* Account Balance */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Account Balance ($)</label>
          <input
            type="number"
            value={account}
            onChange={(e) => setAccount(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            min={0}
          />
        </div>

        {/* Risk % */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Risk %</label>
          <div className="relative">
            <input
              type="number"
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
              step={0.1}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              min={0}
              max={100}
            />
          </div>
          <div className="mt-2 flex gap-1.5">
            {[0.5, 1, 1.5, 2].map((v) => (
              <button
                key={v}
                onClick={() => setRisk(v)}
                className={`flex-1 rounded-lg py-1 text-xs font-medium transition ${risk === v ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}`}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Stop Loss (pips)</label>
          <input
            type="number"
            value={stopPips}
            onChange={(e) => setStopPips(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            min={0}
          />
        </div>

        {/* Custom pip value */}
        {pair.symbol === 'Custom' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Pip Value per Lot ($)</label>
            <input
              type="number"
              value={customPipValue}
              onChange={(e) => setCustomPipValue(Number(e.target.value))}
              step={0.01}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              min={0}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/30">Position Size</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[10px] text-white/25">Standard Lots</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">{lots.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/25">Mini Lots</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white/70">{miniLots.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/25">Micro Lots</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white/50">{microLots.toFixed(0)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
          <span className="text-xs text-white/30">Risk Amount</span>
          <span className="font-mono text-sm font-bold text-white">${riskAmount.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
          <span className="text-xs text-white/30">Pip Value / Lot</span>
          <span className="font-mono text-sm font-bold text-white/70">${pipValue.toFixed(2)}</span>
        </div>
        <p className="mt-3 text-center text-[10px] text-white/20">
          Pip values are approximate for standard USD-denominated accounts.
        </p>
      </div>
    </div>
  );
}

function EconomicCalendar() {
  const now = new Date();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );
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
      .then((d) => { if (d.data) setEvents(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [currentMonth]);

  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0));
  const startDay = monthStart.getUTCDay();
  const daysInMonth = monthEnd.getUTCDate();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === day
        && d.getUTCMonth() === currentMonth.getUTCMonth()
        && d.getUTCFullYear() === currentMonth.getUTCFullYear();
    });
  }

  const selectedEvents = events
    .filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === selectedDate.getUTCDate()
        && d.getUTCMonth() === selectedDate.getUTCMonth()
        && d.getUTCFullYear() === selectedDate.getUTCFullYear()
        && (impactFilter === 'ALL' || e.impactLevel === impactFilter);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Mini calendar */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))}
              className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)))}
              className="rounded-lg px-2 py-1 text-[10px] text-white/30 hover:bg-white/5 hover:text-white/60"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))}
              className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="py-1.5 text-center text-[10px] font-medium text-white/20">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const dayUtc = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day));
            const isToday = dayUtc.getTime() === todayUtc.getTime();
            const isSelected = dayUtc.getTime() === selectedDate.getTime();
            const hasHigh = dayEvents.some((e) => e.impactLevel === 'HIGH');
            const hasMed = !hasHigh && dayEvents.some((e) => e.impactLevel === 'MEDIUM');

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dayUtc)}
                className={`aspect-square rounded-lg p-1 text-left transition ${
                  isSelected
                    ? 'bg-white/10 ring-1 ring-white/20'
                    : isToday
                    ? 'bg-white/5 ring-1 ring-white/10'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className={`block text-center text-[11px] ${isSelected || isToday ? 'font-bold text-white' : 'text-white/40'}`}>{day}</span>
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 flex justify-center gap-0.5">
                    <div className={`h-1 w-1 rounded-full ${hasHigh ? 'bg-red-400' : hasMed ? 'bg-yellow-400' : 'bg-sky-400'}`} />
                    {dayEvents.length > 1 && <div className="h-1 w-1 rounded-full bg-white/20" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
            <button
              key={f}
              onClick={() => setImpactFilter(f as typeof impactFilter)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                impactFilter === f ? 'bg-white/10 text-white' : 'text-white/25 hover:text-white/50'
              }`}
            >
              {f === 'ALL' ? 'All' : IMPACT_STYLES[f as 'HIGH' | 'MEDIUM' | 'LOW'].label}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/40">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}
        </h4>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <Calendar size={28} className="text-white/10" />
            <p className="mt-2 text-xs text-white/20">No events</p>
          </div>
        ) : (
          selectedEvents.map((event) => {
            const impact = event.impactLevel ? IMPACT_STYLES[event.impactLevel] : null;
            return (
              <div key={event.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  {impact && (
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${impact.dot}`} />
                  )}
                  <span className="text-xs font-medium text-white/70 line-clamp-2 flex-1">{event.title}</span>
                </div>
                <p className="mt-1 text-[10px] text-white/25 pl-3.5">
                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  {' UTC'}
                  {event.country ? ` · ${event.country}` : ''}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FuturesScale() {
  const [contract, setContract] = useState(FUTURES_CONTRACTS[0]);
  const [account, setAccount] = useState(25000);
  const [dollarRisk, setDollarRisk] = useState(500);
  const [stopTicks, setStopTicks] = useState(8);

  const riskPct = account > 0 ? (dollarRisk / account) * 100 : 0;
  const contracts = stopTicks > 0 && contract.tickValue > 0
    ? Math.floor(dollarRisk / (stopTicks * contract.tickValue))
    : 0;
  const actualRisk = contracts * stopTicks * contract.tickValue;
  const stopPoints = stopTicks * contract.tickSize;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contract */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Contract</label>
          <select
            value={contract.symbol}
            onChange={(e) => setContract(FUTURES_CONTRACTS.find((c) => c.symbol === e.target.value) ?? FUTURES_CONTRACTS[0])}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20 appearance-none"
          >
            {FUTURES_CONTRACTS.map((c) => (
              <option key={c.symbol} value={c.symbol} className="bg-neutral-900">
                {c.symbol} — {c.name} ({c.exchange})
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-white/30">
            <span>Tick: ${contract.tickSize}</span>
            <span>Tick Value: ${contract.tickValue}</span>
            <span>Exchange: {contract.exchange}</span>
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Account Size ($)</label>
          <input
            type="number"
            value={account}
            onChange={(e) => setAccount(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            min={0}
          />
        </div>

        {/* Dollar Risk */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Dollar Risk ($)</label>
          <input
            type="number"
            value={dollarRisk}
            onChange={(e) => setDollarRisk(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            min={0}
          />
          <p className="mt-1 text-[10px] text-white/25">{riskPct.toFixed(2)}% of account</p>
        </div>

        {/* Stop Ticks */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Stop Loss (ticks)</label>
          <input
            type="number"
            value={stopTicks}
            onChange={(e) => setStopTicks(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            min={1}
          />
          <p className="mt-1 text-[10px] text-white/25">{stopPoints} points</p>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/30">Position Size</p>
        <div className="text-center">
          <p className="font-mono text-5xl font-bold text-white">{contracts}</p>
          <p className="mt-1 text-sm text-white/40">contract{contracts !== 1 ? 's' : ''}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] text-white/30">Actual Risk</p>
            <p className="font-mono text-sm font-bold text-white">${actualRisk.toFixed(0)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] text-white/30">Stop × Tick Value</p>
            <p className="font-mono text-sm font-bold text-white/70">{stopTicks} × ${contract.tickValue}</p>
          </div>
        </div>
        {contracts === 0 && stopTicks > 0 && (
          <p className="mt-3 text-center text-xs text-red-400/60">Risk too small for 1 contract at this stop</p>
        )}
      </div>

      {/* Contract spec table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs font-medium text-white/30 uppercase tracking-wider">Quick Reference</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-2 text-left text-white/20 font-medium">Symbol</th>
                <th className="px-4 py-2 text-left text-white/20 font-medium">Tick</th>
                <th className="px-4 py-2 text-left text-white/20 font-medium">Tick $</th>
                <th className="px-4 py-2 text-left text-white/20 font-medium">Exchange</th>
              </tr>
            </thead>
            <tbody>
              {FUTURES_CONTRACTS.slice(0, 10).map((c) => (
                <tr
                  key={c.symbol}
                  onClick={() => setContract(c)}
                  className={`cursor-pointer border-b border-white/[0.03] transition hover:bg-white/[0.02] ${contract.symbol === c.symbol ? 'bg-white/[0.04]' : ''}`}
                >
                  <td className="px-4 py-2 font-mono font-bold text-white/70">{c.symbol}</td>
                  <td className="px-4 py-2 text-white/40">{c.tickSize}</td>
                  <td className="px-4 py-2 text-white/40">${c.tickValue}</td>
                  <td className="px-4 py-2 text-white/25">{c.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface FngData {
  value: string;
  value_classification: string;
  timestamp: string;
}

function MarketSentiment() {
  const [fng, setFng] = useState<FngData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFng = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('https://api.alternative.me/fng/?limit=7')
      .then((r) => r.json())
      .then((d) => {
        if (d.data && d.data.length > 0) setFng(d.data[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchFng(); }, [fetchFng]);

  const score = fng ? Number(fng.value) : 0;
  const getColor = (s: number) => s >= 75 ? 'text-green-400' : s >= 55 ? 'text-emerald-400' : s >= 45 ? 'text-yellow-400' : s >= 25 ? 'text-orange-400' : 'text-red-400';
  const getBg = (s: number) => s >= 75 ? 'from-green-500/10' : s >= 55 ? 'from-emerald-500/10' : s >= 45 ? 'from-yellow-500/10' : s >= 25 ? 'from-orange-500/10' : 'from-red-500/10';
  const getBarColor = (s: number) => s >= 75 ? 'bg-green-400' : s >= 55 ? 'bg-emerald-400' : s >= 45 ? 'bg-yellow-400' : s >= 25 ? 'bg-orange-400' : 'bg-red-400';

  const ZONES = [
    { label: 'Extreme Fear', range: '0–24', color: 'bg-red-400' },
    { label: 'Fear', range: '25–44', color: 'bg-orange-400' },
    { label: 'Neutral', range: '45–54', color: 'bg-yellow-400' },
    { label: 'Greed', range: '55–74', color: 'bg-emerald-400' },
    { label: 'Extreme Greed', range: '75–100', color: 'bg-green-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Crypto F&G */}
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${fng ? getBg(score) : 'from-white/[0.02]'} to-transparent p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">Crypto Fear & Greed</p>
            <p className="mt-0.5 text-[10px] text-white/20">Source: alternative.me</p>
          </div>
          <button onClick={fetchFng} className="rounded-lg p-2 text-white/20 hover:bg-white/5 hover:text-white/50 transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        ) : error ? (
          <p className="text-sm text-white/30">Could not load data. Check connection.</p>
        ) : fng ? (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <p className={`font-mono text-6xl font-black ${getColor(score)}`}>{fng.value}</p>
              <div className="pb-1">
                <p className={`text-lg font-semibold ${getColor(score)}`}>{fng.value_classification}</p>
                <p className="text-[10px] text-white/25">
                  {new Date(Number(fng.timestamp) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            {/* Bar */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${getBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/20">
              <span>Extreme Fear</span>
              <span>Extreme Greed</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Zone reference */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">Index Zones</p>
        <div className="space-y-2">
          {ZONES.map((z) => (
            <div key={z.label} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${z.color}`} />
              <span className="flex-1 text-xs text-white/50">{z.label}</span>
              <span className="font-mono text-[10px] text-white/25">{z.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Forex sentiment note */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-white/30">Forex Bias Resources</p>
        <p className="text-xs text-white/40">
          For live forex COT data, OANDA order book, and currency strength meters, check:
        </p>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'CFTC COT Reports', url: 'https://www.cftc.gov/dea/futures/deahistfo.htm' },
            { label: 'Myfxbook Sentiment', url: 'https://www.myfxbook.com/community/outlook' },
            { label: 'Forex Factory Calendar', url: 'https://www.forexfactory.com/calendar' },
          ].map((r) => (
            <a
              key={r.label}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-white/[0.02] px-3 py-2 text-white/40 transition hover:bg-white/[0.04] hover:text-white/60"
            >
              {r.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Main TradingHub                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

export function TradingHub() {
  const [activeTab, setActiveTab] = useState<TabId>('forex');

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.015] overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-white/5 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-shrink-0 items-center gap-2 px-5 py-4 text-sm font-medium transition border-b-2 ${
                isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-white/30 hover:text-white/60 hover:border-white/20'
              }`}
            >
              <Icon size={15} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'forex' && <ForexCalculator />}
        {activeTab === 'calendar' && <EconomicCalendar />}
        {activeTab === 'futures' && <FuturesScale />}
        {activeTab === 'sentiment' && <MarketSentiment />}
      </div>
    </div>
  );
}
