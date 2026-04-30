/**
 * Economic calendar data — Finnhub (full month) with Forex Factory fallback.
 * Set FINNHUB_API_KEY in .env for full monthly coverage.
 * Without the key, falls back to Forex Factory (this week + next week only).
 *
 * Free Finnhub API key: https://finnhub.io/register
 */

type Impact = 'HIGH' | 'MEDIUM' | 'LOW' | null;

export interface EconCalEvent {
  id: string;
  title: string;
  shortTitle: string;
  startTime: string;    // ISO UTC
  date: string;         // YYYY-MM-DD UTC
  time: string | null;  // HH:MM UTC or null
  country: string;      // 2-letter ISO or currency code
  currency: string;     // USD, EUR, GBP, …
  impact: Impact;
  actual: string | null;
  estimate: string | null;
  previous: string | null;
  unit: string;
}

/* ── Country → currency ──────────────────────────────────────────── */
const CC: Record<string, string> = {
  US: 'USD', GB: 'GBP', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR',
  ES: 'EUR', NL: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR',
  IE: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', LV: 'EUR', LT: 'EUR',
  JP: 'JPY', CA: 'CAD', AU: 'AUD', NZ: 'NZD', CH: 'CHF', CN: 'CNY',
  KR: 'KRW', IN: 'INR', BR: 'BRL', MX: 'MXN', ZA: 'ZAR', HK: 'HKD',
  SG: 'SGD', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', HU: 'HUF',
  CZ: 'CZK', TR: 'TRY', RU: 'RUB',
};

/* ── Event abbreviation map ──────────────────────────────────────── */
const ABBR: [string, string][] = [
  ['nonfarm payrolls', 'NFP'],
  ['non-farm payrolls', 'NFP'],
  ['fomc minutes', 'FOMC Min'],
  ['fomc statement', 'FOMC'],
  ['fomc', 'FOMC'],
  ['fed interest rate decision', 'Fed Rate'],
  ['interest rate decision', 'Rate'],
  ['federal funds rate', 'Fed Rate'],
  ['consumer price index', 'CPI'],
  ['cpi m/m', 'CPI'],
  ['cpi y/y', 'CPI y/y'],
  ['core cpi', 'Core CPI'],
  ['core pce', 'Core PCE'],
  ['pce price index', 'PCE'],
  ['personal consumption', 'PCE'],
  ['producer price index', 'PPI'],
  ['ppi m/m', 'PPI'],
  ['gross domestic product', 'GDP'],
  ['gdp growth', 'GDP'],
  ['gdp q/q', 'GDP'],
  ['gdp m/m', 'GDP'],
  ['unemployment rate', 'Unemp.'],
  ['initial jobless claims', 'Jobless'],
  ['jobless claims', 'Jobless'],
  ['retail sales', 'Retail'],
  ['durable goods', 'Dur. Goods'],
  ['ism manufacturing', 'ISM Mfg'],
  ['ism non-manufacturing', 'ISM Svc'],
  ['ism services', 'ISM Svc'],
  ['manufacturing pmi', 'Mfg PMI'],
  ['services pmi', 'Svc PMI'],
  ['composite pmi', 'PMI'],
  ['pmi', 'PMI'],
  ['consumer confidence', 'Con. Conf.'],
  ['building permits', 'Bld. Perm.'],
  ['housing starts', 'Housing'],
  ['trade balance', 'Trade Bal.'],
  ['current account', 'Curr. Acct'],
  ['ecb interest rate', 'ECB Rate'],
  ['boe interest rate', 'BoE Rate'],
  ['rba interest rate', 'RBA Rate'],
  ['boc interest rate', 'BoC Rate'],
  ['rbnz interest rate', 'RBNZ Rate'],
  ['average hourly earnings', 'AHE'],
  ['inflation rate', 'CPI'],
  ['core inflation', 'Core CPI'],
  ['bank holiday', 'Holiday'],
  ['flash pmi', 'Flash PMI'],
];

export function abbreviateEvent(title: string): string {
  const lower = title.toLowerCase().trim();
  for (const [key, short] of ABBR) {
    if (lower.includes(key)) return short;
  }
  const words = title.split(/\s+/);
  return words.length <= 2 ? title : words.slice(0, 2).join(' ');
}

/* ── Timezone util (ET → UTC) ────────────────────────────────────── */
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
    const desired = Date.UTC(year, month - 1, day, hour, minute);
    return new Date(guess.getTime() - (asIfUtc - desired));
  } catch {
    return guess;
  }
}

/* ── Finnhub mapper ──────────────────────────────────────────────── */
interface FinnhubRow {
  country: string;
  event: string;
  impact: string;
  actual: number | null;
  estimate: number | null;
  prev: number | null;
  time: string;
  unit: string;
}

function mapImpact(s: string): Impact {
  const v = (s ?? '').toLowerCase();
  if (v === 'high') return 'HIGH';
  if (v === 'medium' || v === 'moderate') return 'MEDIUM';
  if (v === 'low') return 'LOW';
  return null;
}

function fmt(val: number | null | undefined, unit: string): string | null {
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
  const isoTime = timePart ? `${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}` : null;
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
    actual: fmt(raw.actual, unit),
    estimate: fmt(raw.estimate, unit),
    previous: fmt(raw.prev, unit),
    unit,
  };
}

/* ── Forex Factory fallback ──────────────────────────────────────── */
async function fromForexFactory(year: number, month: number): Promise<EconCalEvent[]> {
  const { getForexFactoryEvents } = await import('./forex-factory');
  const events = await getForexFactoryEvents();
  return events
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
        currency: e.country,
        impact: e.impactLevel,
        actual: null,
        estimate: null,
        previous: null,
        unit: '',
      } satisfies EconCalEvent;
    });
}

/* ── In-memory cache (per month) ─────────────────────────────────── */
const cache = new Map<string, { data: EconCalEvent[]; expiresAt: number }>();
const TTL = 5 * 60 * 1000;

export async function getEconomicCalendarEvents(year: number, month: number): Promise<EconCalEvent[]> {
  const key = `${year}-${month}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.data;

  const apiKey = process.env.FINNHUB_API_KEY;

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
        .sort((a: EconCalEvent, b: EconCalEvent) => a.startTime.localeCompare(b.startTime));

      cache.set(key, { data: events, expiresAt: now + TTL });
      return events;
    } catch {
      if (hit) return hit.data;
    }
  }

  // Fallback: Forex Factory (this week + next week)
  const events = await fromForexFactory(year, month);
  events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  cache.set(key, { data: events, expiresAt: now + TTL });
  return events;
}
