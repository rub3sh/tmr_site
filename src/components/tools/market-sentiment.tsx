'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, ArrowDownToLine,
  Flame, Snowflake, Activity, BarChart3,
} from 'lucide-react';

/* ─── Shared types ────────────────────────────────────────────────────── */
interface ForexSymbolData {
  id: number;
  name: string;
  longPct: number;
  shortPct: number;
  longLots?: number;
  shortLots?: number;
  longPositions?: number;
  shortPositions?: number;
  longPrice?: number;
  shortPrice?: number;
  drawdown?: number;
}
interface FngRow { value: string; value_classification: string; timestamp: string }
interface CoinRow {
  id: string; symbol: string; name: string; image: string;
  current_price: number; market_cap: number; market_cap_rank: number;
  total_volume: number; price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  ath: number; ath_change_percentage: number;
  high_24h: number; low_24h: number;
  sparkline_in_7d?: { price: number[] };
}
interface GlobalData {
  total_market_cap?: { usd: number };
  total_volume?: { usd: number };
  market_cap_percentage?: Record<string, number>;
  market_cap_change_percentage_24h_usd?: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   SHARED CHART PRIMITIVES (SVG, theme-matched)
═══════════════════════════════════════════════════════════════════════ */

function ProportionBar({ longPct, shortPct, height = 10 }: { longPct: number; shortPct: number; height?: number }) {
  const total = longPct + shortPct || 1;
  const lp = (longPct / total) * 100;
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-white/5" style={{ height }}>
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/80 to-emerald-400 transition-all duration-700 ease-out"
        style={{ width: `${lp}%` }}
      />
      <div
        className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-500/80 to-red-400 transition-all duration-700 ease-out"
        style={{ width: `${100 - lp}%` }}
      />
    </div>
  );
}

function Sparkline({ data, width = 80, height = 24, color = '#9ca3af', fill = true }: {
  data: number[]; width?: number; height?: number; color?: string; fill?: boolean;
}) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const trendUp = data[data.length - 1] >= data[0];
  const stroke = color === 'auto' ? (trendUp ? '#34d399' : '#f87171') : color;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <path d={areaPath} fill={stroke} fillOpacity={0.12} />
      )}
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SemiGauge({ value, label, max = 100, size = 220 }: { value: number; label: string; max?: number; size?: number }) {
  const pct = Math.max(0, Math.min(max, value)) / max;
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const startA = Math.PI;
  const endA = startA + pct * Math.PI;
  const x1 = cx + r * Math.cos(startA);
  const y1 = cy + r * Math.sin(startA);
  const x2 = cx + r * Math.cos(endA);
  const y2 = cy + r * Math.sin(endA);
  const largeArc = pct > 0.5 ? 1 : 0;
  const trackPath = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`;
  const fillPath = `M ${x1.toFixed(2)},${y1.toFixed(2)} A ${r},${r} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;

  const color =
    value >= 75 ? '#4ade80' :
    value >= 55 ? '#34d399' :
    value >= 45 ? '#facc15' :
    value >= 25 ? '#fb923c' :
                  '#f87171';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#fb923c" />
            <stop offset="55%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} strokeLinecap="round" />
        <path d={trackPath} fill="none" stroke="url(#gauge-grad)" strokeWidth={14} strokeLinecap="round" opacity={0.18} />
        <path d={fillPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="font-mono font-black"
          fill={color} style={{ fontSize: size / 5 }}>
          {value}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" style={{ fontSize: 11, letterSpacing: 1 }}>
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

function LineChart({
  data,
  height = 140,
  color = '#34d399',
  yLabels = true,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  yLabels?: boolean;
}) {
  if (!data || data.length < 2) return null;
  const W = 100;
  const H = 100;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const pts = data.map((d, i) => `${(i * step).toFixed(2)},${(H - ((d.value - min) / range) * H).toFixed(2)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  const yTicks = [max, (max + min) / 2, min];

  return (
    <div className="relative w-full" style={{ height }}>
      {yLabels && (
        <div className="absolute inset-y-0 left-0 flex w-12 flex-col justify-between py-1 text-[9px] text-white/30">
          {yTicks.map((v, i) => <span key={i}>{Math.round(v)}</span>)}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={`absolute inset-y-0 right-0 ${yLabels ? 'left-12' : 'left-0'}`}
        style={{ height: '100%' }}
      >
        <defs>
          <linearGradient id={`area-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        ))}
        <path d={areaPath} fill={`url(#area-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Donut({ longPct, shortPct, size = 140, stroke = 16 }: { longPct: number; shortPct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = longPct + shortPct || 1;
  const lFrac = longPct / total;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#34d399" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(c * lFrac).toFixed(2)} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#f87171" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(c * (1 - lFrac)).toFixed(2)} ${c}`}
        strokeDashoffset={`${-c * lFrac}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.7s ease, stroke-dashoffset 0.7s ease' }}
      />
      <text x={size / 2} y={size / 2 - 3} textAnchor="middle" className="font-mono font-bold" fill="#fff" style={{ fontSize: size / 6 }}>
        {Math.round(longPct)}<tspan style={{ fontSize: size / 14, fill: 'rgba(255,255,255,0.4)' }}>%</tspan>
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#34d399" style={{ fontSize: 9, letterSpacing: 1 }}>LONG</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOREX SENTIMENT
═══════════════════════════════════════════════════════════════════════ */

const FOREX_GROUPS = [
  {
    label: 'Majors',
    ids: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    label: 'Crosses',
    ids: [8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
  },
  {
    label: 'Metals',
    ids: [34, 36],
  },
  {
    label: 'Exotics',
    ids: [29, 31, 103, 107, 131, 137],
  },
];

type SortKey = 'long' | 'short' | 'drawdown' | 'name';

function ForexSentiment() {
  const [data, setData] = useState<ForexSymbolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');
  const [group, setGroup] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('long');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showOnlyDrawdown, setShowOnlyDrawdown] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const ids = FOREX_GROUPS[group].ids;

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/sentiment/forex?symbols=${ids.join(',')}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.data ?? []);
        setSource(d.meta?.source ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let arr = [...data];
    if (showOnlyDrawdown) arr = arr.filter((d) => (d.drawdown ?? 0) > 50);
    arr.sort((a, b) => {
      let av = 0, bv = 0;
      switch (sortBy) {
        case 'long': av = a.longPct; bv = b.longPct; break;
        case 'short': av = a.shortPct; bv = b.shortPct; break;
        case 'drawdown': av = a.drawdown ?? 0; bv = b.drawdown ?? 0; break;
        case 'name': return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [data, sortBy, sortDir, showOnlyDrawdown]);

  const aggregateLong = data.length > 0 ? data.reduce((sum, d) => sum + d.longPct, 0) / data.length : 50;

  const detail = data.find((d) => d.id === selected) ?? null;

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
  }

  return (
    <div className="space-y-5">
      {/* Header overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <Activity size={11} /> Crowd Bias
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className={`font-mono text-2xl font-bold ${aggregateLong >= 55 ? 'text-emerald-400' : aggregateLong <= 45 ? 'text-red-400' : 'text-yellow-400'}`}>
              {aggregateLong.toFixed(1)}%
            </span>
            <span className="pb-1 text-[10px] text-white/35">long avg</span>
          </div>
          <div className="mt-2"><ProportionBar longPct={aggregateLong} shortPct={100 - aggregateLong} height={6} /></div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <Flame size={11} /> Most Bullish
          </div>
          {data.length > 0 ? (
            (() => {
              const top = [...data].sort((a, b) => b.longPct - a.longPct)[0];
              return (
                <div className="mt-2 flex items-end justify-between">
                  <span className="font-mono text-base font-bold text-white">{top.name}</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400">{Math.round(top.longPct)}%</span>
                </div>
              );
            })()
          ) : <div className="mt-2 h-7 w-32 animate-pulse rounded bg-white/5" />}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <Snowflake size={11} /> Most Bearish
          </div>
          {data.length > 0 ? (
            (() => {
              const top = [...data].sort((a, b) => b.shortPct - a.shortPct)[0];
              return (
                <div className="mt-2 flex items-end justify-between">
                  <span className="font-mono text-base font-bold text-white">{top.name}</span>
                  <span className="font-mono text-2xl font-bold text-red-400">{Math.round(top.shortPct)}%</span>
                </div>
              );
            })()
          ) : <div className="mt-2 h-7 w-32 animate-pulse rounded bg-white/5" />}
        </div>
      </div>

      {/* Group tabs + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FOREX_GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => setGroup(i)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                group === i ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyDrawdown(!showOnlyDrawdown)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              showOnlyDrawdown ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30' : 'bg-white/[0.04] text-white/40 hover:text-white/65'
            }`}
          >
            <ArrowDownToLine size={11} /> Drawdown &gt; 50p
          </button>
          <button onClick={load} className="rounded-full p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/70">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Sortable table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead className="bg-white/[0.02]">
            <tr className="text-left text-[10px] uppercase tracking-wider text-white/35">
              <th className="cursor-pointer px-3 py-2.5 transition hover:text-white/70" onClick={() => handleSort('name')}>Symbol</th>
              <th className="cursor-pointer px-3 py-2.5 transition hover:text-white/70" onClick={() => handleSort('long')}>
                Sentiment {sortBy === 'long' && (sortDir === 'desc' ? '▼' : '▲')}
              </th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Long %</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Short %</th>
              <th className="hidden cursor-pointer px-3 py-2.5 transition hover:text-white/70 md:table-cell" onClick={() => handleSort('drawdown')}>
                Volume L/S {sortBy === 'drawdown' && (sortDir === 'desc' ? '▼' : '▲')}
              </th>
              <th className="hidden px-3 py-2.5 lg:table-cell">Positions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(7)].map((_, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td colSpan={6} className="px-3 py-3"><div className="h-5 animate-pulse rounded bg-white/5" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-white/30">No symbols match filter</td></tr>
            ) : (
              filtered.map((d) => {
                const bullish = d.longPct >= 55;
                const bearish = d.shortPct >= 55;
                const isSel = selected === d.id;
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(isSel ? null : d.id)}
                    className={`cursor-pointer border-t border-white/5 transition hover:bg-white/[0.04] ${isSel ? 'bg-white/[0.06]' : ''}`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{d.name}</span>
                        {bullish && <TrendingUp size={11} className="text-emerald-400" />}
                        {bearish && <TrendingDown size={11} className="text-red-400" />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-32 sm:w-40"><ProportionBar longPct={d.longPct} shortPct={d.shortPct} height={8} /></div>
                        <span className={`hidden font-mono text-[10px] font-semibold sm:inline ${bullish ? 'text-emerald-400' : bearish ? 'text-red-400' : 'text-yellow-400'}`}>
                          {Math.round(d.longPct)}/{Math.round(d.shortPct)}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 font-mono text-emerald-400 sm:table-cell">{d.longPct.toFixed(1)}%</td>
                    <td className="hidden px-3 py-2.5 font-mono text-red-400 sm:table-cell">{d.shortPct.toFixed(1)}%</td>
                    <td className="hidden px-3 py-2.5 font-mono text-white/55 md:table-cell">
                      {d.longLots !== undefined ? `${(d.longLots / 1000).toFixed(1)}k / ${((d.shortLots ?? 0) / 1000).toFixed(1)}k` : '—'}
                    </td>
                    <td className="hidden px-3 py-2.5 font-mono text-white/45 lg:table-cell">
                      {d.longPositions !== undefined ? `${d.longPositions} / ${d.shortPositions}` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-xl font-bold text-white">{detail.name}</h3>
              <p className="text-[10px] text-white/35">Detailed positioning breakdown</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-white/35 hover:text-white/70">Close ✕</button>
          </div>
          <div className="grid gap-5 md:grid-cols-[180px_1fr]">
            <div className="flex items-center justify-center"><Donut longPct={detail.longPct} shortPct={detail.shortPct} size={160} /></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Long Volume" value={detail.longLots ? `${detail.longLots.toLocaleString()} lots` : '—'} accent="emerald" />
              <Stat label="Short Volume" value={detail.shortLots ? `${detail.shortLots.toLocaleString()} lots` : '—'} accent="red" />
              <Stat label="Long Positions" value={detail.longPositions?.toLocaleString() ?? '—'} accent="emerald" />
              <Stat label="Short Positions" value={detail.shortPositions?.toLocaleString() ?? '—'} accent="red" />
              <Stat label="Avg Long Price" value={detail.longPrice?.toFixed(detail.name.includes('JPY') ? 2 : 5) ?? '—'} accent="emerald" />
              <Stat label="Avg Short Price" value={detail.shortPrice?.toFixed(detail.name.includes('JPY') ? 2 : 5) ?? '—'} accent="red" />
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[9px] text-white/20">
        Source: {source === 'myfxbook' ? 'Myfxbook community outlook · live' : 'fallback model · live data unavailable'} · 5-min cache
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: 'emerald' | 'red' | 'white' }) {
  const color = accent === 'emerald' ? 'text-emerald-400' : accent === 'red' ? 'text-red-400' : 'text-white';
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p>
      <p className={`mt-1 font-mono text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CRYPTO SENTIMENT
═══════════════════════════════════════════════════════════════════════ */

function CryptoSentiment() {
  const [fng, setFng] = useState<FngRow[]>([]);
  const [coins, setCoins] = useState<CoinRow[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/sentiment/crypto')
      .then((r) => r.json())
      .then((d) => {
        if (d.fearGreed) setFng(d.fearGreed);
        if (d.coins) setCoins(d.coins);
        if (d.global) setGlobal(d.global);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const fngScore = fng[0] ? Number(fng[0].value) : 0;
  const fngLabel = fng[0]?.value_classification ?? '—';
  const fngHistory = useMemo(
    () => [...fng].reverse().map((f) => ({ label: f.timestamp, value: Number(f.value) })),
    [fng]
  );

  const totalMcap = global?.total_market_cap?.usd ?? 0;
  const mcapChange = global?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom = global?.market_cap_percentage?.btc ?? 0;
  const ethDom = global?.market_cap_percentage?.eth ?? 0;

  return (
    <div className="space-y-5">
      {/* Top: FnG gauge + market overview */}
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-transparent p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Fear &amp; Greed</p>
            <button onClick={load} className="rounded p-1 text-white/30 hover:bg-white/5 hover:text-white/70">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <SemiGauge value={fngScore} label={fngLabel} size={220} />
          <p className="mt-1 text-center text-[9px] text-white/25">alternative.me index</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BigStat
            label="Total Market Cap"
            value={`$${(totalMcap / 1e12).toFixed(2)}T`}
            change={mcapChange}
          />
          <BigStat
            label="24h Volume"
            value={`$${((global?.total_volume?.usd ?? 0) / 1e9).toFixed(1)}B`}
          />
          <BigStat label="BTC Dominance" value={`${btcDom.toFixed(2)}%`} />
          <BigStat label="ETH Dominance" value={`${ethDom.toFixed(2)}%`} />
        </div>
      </div>

      {/* FnG history chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-white/60">30-Day Fear &amp; Greed Trend</p>
          <div className="flex items-center gap-2 text-[10px] text-white/35">
            <span>0 <span className="text-red-400">Extreme Fear</span></span>
            <span className="text-white/15">|</span>
            <span><span className="text-emerald-400">Extreme Greed</span> 100</span>
          </div>
        </div>
        {loading ? (
          <div className="h-[140px] animate-pulse rounded bg-white/[0.03]" />
        ) : (
          <LineChart data={fngHistory} height={150} color={fngScore >= 50 ? '#34d399' : '#f87171'} yLabels />
        )}
      </div>

      {/* Top coins with sparklines */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <BarChart3 size={13} /> Top 15 by Market Cap
          </p>
          <p className="text-[10px] text-white/30">CoinGecko · 7d sparkline</p>
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[10px] uppercase tracking-wider text-white/35">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Coin</th>
                <th className="px-3 py-2.5 text-right">Price</th>
                <th className="hidden px-3 py-2.5 text-right sm:table-cell">24h</th>
                <th className="hidden px-3 py-2.5 text-right md:table-cell">7d</th>
                <th className="hidden px-3 py-2.5 text-right md:table-cell">30d</th>
                <th className="hidden px-3 py-2.5 text-right lg:table-cell">From ATH</th>
                <th className="px-3 py-2.5">7d Trend</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td colSpan={8} className="px-3 py-3"><div className="h-5 animate-pulse rounded bg-white/5" /></td>
                  </tr>
                ))
              ) : coins.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-white/30">CoinGecko data unavailable</td></tr>
              ) : (
                coins.map((c) => {
                  const pct24 = c.price_change_percentage_24h ?? 0;
                  const pct7 = c.price_change_percentage_7d_in_currency ?? 0;
                  const pct30 = c.price_change_percentage_30d_in_currency ?? 0;
                  const ath = c.ath_change_percentage ?? 0;
                  return (
                    <tr key={c.id} className="border-t border-white/5 transition hover:bg-white/[0.04]">
                      <td className="px-3 py-2 font-mono text-white/35">{c.market_cap_rank}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.image} alt="" width={18} height={18} className="rounded-full" />
                          <span className="font-medium text-white">{c.name}</span>
                          <span className="font-mono text-[9px] uppercase text-white/30">{c.symbol}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-white">${c.current_price.toLocaleString(undefined, { maximumFractionDigits: c.current_price < 1 ? 6 : 2 })}</td>
                      <td className={`hidden px-3 py-2 text-right font-mono sm:table-cell ${pct24 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct24 >= 0 ? '+' : ''}{pct24.toFixed(2)}%
                      </td>
                      <td className={`hidden px-3 py-2 text-right font-mono md:table-cell ${pct7 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct7 >= 0 ? '+' : ''}{pct7.toFixed(2)}%
                      </td>
                      <td className={`hidden px-3 py-2 text-right font-mono md:table-cell ${pct30 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct30 >= 0 ? '+' : ''}{pct30.toFixed(2)}%
                      </td>
                      <td className={`hidden px-3 py-2 text-right font-mono lg:table-cell ${ath >= -10 ? 'text-emerald-400' : ath >= -30 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {ath.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2">
                        {c.sparkline_in_7d?.price?.length ? (
                          <Sparkline data={c.sparkline_in_7d.price} width={80} height={24} color="auto" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold text-white">{value}</p>
      {change !== undefined && (
        <p className={`mt-0.5 font-mono text-[11px] ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}% 24h
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FUTURES SENTIMENT (uses same /api/sentiment/forex endpoint with index IDs)
═══════════════════════════════════════════════════════════════════════ */

const FUTURES_GROUPS = [
  { label: 'US Indices', ids: [40, 41, 42] },
  { label: 'EU Indices', ids: [43, 45, 47, 48, 50] },
  { label: 'Asian Indices', ids: [46, 49, 51] },
  { label: 'Energy & Metals', ids: [37, 38, 34, 36] },
];

function FuturesSentiment() {
  const [data, setData] = useState<ForexSymbolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(0);

  const ids = FUTURES_GROUPS[group].ids;

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/sentiment/forex?symbols=${ids.join(',')}`)
      .then((r) => r.json())
      .then((d) => setData(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FUTURES_GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => setGroup(i)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                group === i ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="rounded-full p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/70">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/[0.03]" />
          ))
        ) : data.length === 0 ? (
          <p className="col-span-full py-8 text-center text-xs text-white/30">No data available</p>
        ) : (
          data.map((d) => {
            const bullish = d.longPct >= 55;
            const bearish = d.shortPct >= 55;
            const trend = bullish ? 'bullish' : bearish ? 'bearish' : 'neutral';
            const accent = bullish ? 'border-emerald-500/30 from-emerald-500/[0.06]' : bearish ? 'border-red-500/30 from-red-500/[0.06]' : 'border-white/10 from-white/[0.03]';
            return (
              <div key={d.id} className={`rounded-2xl border bg-gradient-to-br to-transparent p-4 ${accent}`}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-mono text-base font-bold text-white">{d.name}</h4>
                    <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wider ${bullish ? 'text-emerald-400' : bearish ? 'text-red-400' : 'text-yellow-400'}`}>
                      {trend}
                    </p>
                  </div>
                  {bullish ? <TrendingUp size={18} className="text-emerald-400" />
                    : bearish ? <TrendingDown size={18} className="text-red-400" />
                    : <Activity size={18} className="text-yellow-400" />}
                </div>
                <div className="flex items-center justify-center py-2">
                  <Donut longPct={d.longPct} shortPct={d.shortPct} size={120} stroke={14} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-500/[0.08] py-1.5">
                    <p className="text-[9px] text-white/40">Long Vol.</p>
                    <p className="font-mono text-xs font-bold text-emerald-400">{d.longLots ? `${(d.longLots / 1000).toFixed(1)}k` : '—'}</p>
                  </div>
                  <div className="rounded-lg bg-red-500/[0.08] py-1.5">
                    <p className="text-[9px] text-white/40">Short Vol.</p>
                    <p className="font-mono text-xs font-bold text-red-400">{d.shortLots ? `${(d.shortLots / 1000).toFixed(1)}k` : '—'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN — tabbed sentiment dashboard
═══════════════════════════════════════════════════════════════════════ */

const SENTIMENT_TABS = [
  { id: 'forex', label: 'Forex' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'futures', label: 'Futures' },
] as const;
type SentimentTab = (typeof SENTIMENT_TABS)[number]['id'];

export function MarketSentiment() {
  const [tab, setTab] = useState<SentimentTab>('forex');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SENTIMENT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'forex' && <ForexSentiment />}
      {tab === 'crypto' && <CryptoSentiment />}
      {tab === 'futures' && <FuturesSentiment />}
    </div>
  );
}
