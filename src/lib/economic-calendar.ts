/**
 * Economic calendar — Finnhub primary (full month), Forex Factory fallback.
 * Add FINNHUB_API_KEY to .env for full monthly data: https://finnhub.io/register
 */

import fs from 'fs';
import path from 'path';
import { getForexFactoryEvents } from './forex-factory';

type Impact = 'HIGH' | 'MEDIUM' | 'LOW' | null;

export interface EconCalEvent {
  id: string;
  title: string;
  shortTitle: string;
  startTime: string;    // ISO UTC
  date: string;         // YYYY-MM-DD UTC
  time: string | null;  // HH:MM UTC or null
  country: string;
  currency: string;     // USD, EUR, GBP, …
  impact: Impact;
  actual: string | null;
  estimate: string | null;
  previous: string | null;
  unit: string;
}

/* ── Country → currency ────────────────────────────────────────────── */
const CC: Record<string, string> = {
  US: 'USD', GB: 'GBP', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR',
  ES: 'EUR', NL: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR',
  IE: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', LV: 'EUR', LT: 'EUR',
  JP: 'JPY', CA: 'CAD', AU: 'AUD', NZ: 'NZD', CH: 'CHF', CN: 'CNY',
  KR: 'KRW', IN: 'INR', BR: 'BRL', MX: 'MXN', ZA: 'ZAR', HK: 'HKD',
  SG: 'SGD', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', HU: 'HUF',
  CZ: 'CZK', TR: 'TRY', RU: 'RUB',
};

/* ── Abbreviation map ──────────────────────────────────────────────── */
const ABBR: [string, string][] = [
  ['nonfarm payrolls', 'NFP'], ['non-farm payrolls', 'NFP'],
  ['fomc minutes', 'FOMC Min'], ['fomc statement', 'FOMC'], ['fomc', 'FOMC'],
  ['fed interest rate decision', 'Fed Rate'], ['federal funds rate', 'Fed Rate'],
  ['interest rate decision', 'Rate'],
  ['consumer price index', 'CPI'], ['cpi m/m', 'CPI'], ['cpi y/y', 'CPI y/y'],
  ['core cpi', 'Core CPI'], ['core pce', 'Core PCE'],
  ['pce price index', 'PCE'], ['personal consumption', 'PCE'],
  ['producer price index', 'PPI'], ['ppi m/m', 'PPI'],
  ['gross domestic product', 'GDP'], ['gdp growth', 'GDP'], ['gdp q/q', 'GDP'],
  ['unemployment rate', 'Unemp.'], ['initial jobless claims', 'Jobless'], ['jobless claims', 'Jobless'],
  ['retail sales', 'Retail'], ['durable goods', 'Dur. Goods'],
  ['ism manufacturing', 'ISM Mfg'], ['ism non-manufacturing', 'ISM Svc'], ['ism services', 'ISM Svc'],
  ['manufacturing pmi', 'Mfg PMI'], ['services pmi', 'Svc PMI'], ['composite pmi', 'PMI'],
  ['flash pmi', 'Flash PMI'], ['pmi', 'PMI'],
  ['consumer confidence', 'Con. Conf.'], ['building permits', 'Bld. Perm.'], ['housing starts', 'Housing'],
  ['trade balance', 'Trade Bal.'], ['current account', 'Curr. Acct'],
  ['ecb interest rate', 'ECB Rate'], ['boe interest rate', 'BoE Rate'],
  ['rba interest rate', 'RBA Rate'], ['boc interest rate', 'BoC Rate'],
  ['rbnz interest rate', 'RBNZ Rate'], ['average hourly earnings', 'AHE'],
  ['inflation rate', 'CPI'], ['core inflation', 'Core CPI'], ['bank holiday', 'Holiday'],
];

export function abbreviateEvent(title: string): string {
  const lower = title.toLowerCase().trim();
  for (const [key, short] of ABBR) {
    if (lower.includes(key)) return short;
  }
  const words = title.split(/\s+/);
  return words.length <= 2 ? title : words.slice(0, 2).join(' ');
}

/* ── ET → UTC conversion ───────────────────────────────────────────── */
function etToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const parts = fmt.formatToParts(guess);
    const p = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? '0');
    const asIfUtc = Date.UTC(p('year'), p('month') - 1, p('day'), p('hour'), p('minute'), p('second'));
    return new Date(guess.getTime() - (asIfUtc - Date.UTC(year, month - 1, day, hour, minute)));
  } catch {
    return guess;
  }
}

/* ── Finnhub mapper ────────────────────────────────────────────────── */
interface FinnhubRow {
  country: string; event: string; impact: string;
  actual: number | null; estimate: number | null; prev: number | null;
  time: string; unit: string;
}

function mapImpact(s: string): Impact {
  const v = (s ?? '').toLowerCase();
  if (v === 'high') return 'HIGH';
  if (v === 'medium' || v === 'moderate') return 'MEDIUM';
  if (v === 'low') return 'LOW';
  return null;
}

function fmtVal(val: number | null | undefined, unit: string): string | null {
  if (val == null) return null;
  return unit ? `${val}${unit}` : String(val);
}

function mapFinnhubRow(raw: FinnhubRow): EconCalEvent | null {
  if (!raw.event || !raw.time) return null;
  const country = (raw.country ?? '').toUpperCase();
  const currency = CC[country] ?? country;
  const [datePart, timePart] = raw.time.split(' ');
  if (!datePart) return null;

  let utcDate: Date;
  if (timePart) {
    const [hh, mm] = timePart.split(':').map(Number);
    const [yyyy, mo, dd] = datePart.split('-').map(Number);
    utcDate = etToUtc(yyyy, mo, dd, hh, mm);
  } else {
    const [yyyy, mo, dd] = datePart.split('-').map(Number);
    utcDate = new Date(Date.UTC(yyyy, mo - 1, dd, 0, 0));
  }

  const isoDate = utcDate.toISOString().split('T')[0];
  const isoTime = timePart
    ? `${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}`
    : null;
  const unit = raw.unit ?? '';

  return {
    id: `fh-${isoDate}-${raw.event}-${country}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    title: raw.event,
    shortTitle: abbreviateEvent(raw.event),
    startTime: utcDate.toISOString(),
    date: isoDate,
    time: isoTime,
    country,
    currency,
    impact: mapImpact(raw.impact),
    actual: fmtVal(raw.actual, unit),
    estimate: fmtVal(raw.estimate, unit),
    previous: fmtVal(raw.prev, unit),
    unit,
  };
}

/* ── Forex Factory fallback ────────────────────────────────────────── */
async function fromForexFactory(year: number, month: number): Promise<EconCalEvent[]> {
  const ffEvents = await getForexFactoryEvents();
  return ffEvents
    .filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    })
    .map((e) => {
      const iso = e.startTime.toISOString();
      return {
        id: e.id,
        title: e.title,
        shortTitle: abbreviateEvent(e.title),
        startTime: iso,
        date: iso.split('T')[0],
        time: iso.split('T')[1]?.substring(0, 5) ?? null,
        country: e.country,
        currency: e.country, // FF uses currency codes in country field
        impact: e.impactLevel,
        actual: null,
        estimate: null,
        previous: null,
        unit: '',
      } satisfies EconCalEvent;
    });
}

/* ── File-based cache (survives dev hot-reloads) ───────────────────── */
const CACHE_DIR = '/tmp';
const CACHE_TTL_FF = 60 * 60 * 1000;    // 60 min — FF updates hourly
const CACHE_TTL_FH = 10 * 60 * 1000;   // 10 min for Finnhub

function fileCachePath(key: string) {
  return path.join(CACHE_DIR, `econ-cal-${key.replace(/[^a-z0-9]/gi, '-')}.json`);
}

function readFileCache(key: string): { data: EconCalEvent[]; expiresAt: number } | null {
  try {
    const raw = fs.readFileSync(fileCachePath(key), 'utf-8');
    const parsed = JSON.parse(raw) as { data: EconCalEvent[]; expiresAt: number };
    return parsed;
  } catch {
    return null;
  }
}

function writeFileCache(key: string, data: EconCalEvent[], expiresAt: number) {
  try {
    fs.writeFileSync(fileCachePath(key), JSON.stringify({ data, expiresAt }), 'utf-8');
  } catch {
    // non-critical
  }
}

/* ── Memory cache (fast path within same process) ──────────────────── */
const memCache = new Map<string, { data: EconCalEvent[]; expiresAt: number }>();

/* ── Main export ───────────────────────────────────────────────────── */
export async function getEconomicCalendarEvents(year: number, month: number): Promise<EconCalEvent[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  // Include source in key so adding/removing the key busts the cache automatically
  const key = `${year}-${month}-${apiKey ? 'fh' : 'ff'}`;
  const now = Date.now();

  // 1. Memory cache
  const mem = memCache.get(key);
  if (mem && mem.expiresAt > now) return mem.data;

  // 2. File cache (survives hot-reloads)
  const file = readFileCache(key);
  if (file && file.expiresAt > now) {
    memCache.set(key, file);
    return file.data;
  }

  // 3. Finnhub
  if (apiKey) {
    try {
      const pad = (n: number) => String(n).padStart(2, '0');
      const from = `${year}-${pad(month)}-01`;
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const to = `${year}-${pad(month)}-${lastDay}`;

      const res = await fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`Finnhub ${res.status}`);
      const json = await res.json();
      const events = (json.economicCalendar as FinnhubRow[] ?? [])
        .map(mapFinnhubRow)
        .filter((e): e is EconCalEvent => e !== null)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      memCache.set(key, { data: events, expiresAt: now + CACHE_TTL_FH });
      writeFileCache(key, events, now + CACHE_TTL_FH);
      return events;
    } catch {
      // fall through to FF
    }
  }

  // 4. Forex Factory fallback
  try {
    const events = await fromForexFactory(year, month);
    events.sort((a, b) => a.startTime.localeCompare(b.startTime));
    memCache.set(key, { data: events, expiresAt: now + CACHE_TTL_FF });
    writeFileCache(key, events, now + CACHE_TTL_FF);
    return events;
  } catch {
    // Return stale file cache data if available, even if expired
    if (file) return file.data;
    return [];
  }
}
