import { NextRequest } from 'next/server';

export const revalidate = 300; // 5 minutes

interface ParsedSymbol {
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
  current?: number;
  drawdown?: number;
}

const SYMBOL_NAMES: Record<number, string> = {
  1: 'EUR/USD', 2: 'GBP/USD', 3: 'USD/JPY', 4: 'USD/CHF', 5: 'USD/CAD',
  6: 'AUD/USD', 7: 'NZD/USD', 8: 'EUR/GBP', 9: 'EUR/JPY', 10: 'GBP/JPY',
  11: 'EUR/CHF', 12: 'AUD/JPY', 13: 'GBP/CHF', 14: 'EUR/AUD', 15: 'EUR/CAD',
  17: 'GBP/CAD', 18: 'CAD/JPY', 19: 'AUD/CAD', 20: 'NZD/JPY', 21: 'CHF/JPY',
  22: 'AUD/NZD', 23: 'AUD/CHF', 24: 'NZD/CHF', 25: 'NZD/CAD', 26: 'GBP/AUD',
  27: 'EUR/NZD', 28: 'GBP/NZD', 29: 'USD/NOK', 31: 'USD/SEK',
  34: 'XAU/USD', 36: 'XAG/USD', 37: 'WTI Oil', 38: 'Nat Gas',
  40: 'S&P 500', 41: 'NASDAQ', 42: 'Dow Jones', 43: 'FTSE 100', 45: 'DAX',
  46: 'Nikkei 225', 47: 'CAC 40', 48: 'IBEX 35', 49: 'ASX 200', 50: 'SMI',
  51: 'SSE Comp.', 103: 'EUR/TRY', 107: 'USD/ZAR', 131: 'USD/MXN', 137: 'USD/SGD',
  1233: 'BTC/USD', 1234: 'ETH/USD', 1236: 'XRP/USD', 1245: 'LTC/USD',
  1246: 'BCH/USD', 1247: 'DASH/USD', 1815: 'EOS/USD', 1863: 'ADA/USD',
  1893: 'XLM/USD', 2012: 'TRX/USD', 5079: 'BNB/USD', 5435: 'SOL/USD',
  5779: 'DOGE/USD',
};

/**
 * Parse the Myfxbook fxOutlook.js script. The script body contains a giant
 * document.write() call with the rendered HTML; we extract that string and
 * pull per-symbol numbers from it.
 */
function parseMyfxbookScript(scriptText: string, requestedIds: number[]): ParsedSymbol[] {
  // The script wraps everything in document.write('...html...'). Extract that.
  const match = scriptText.match(/document\.write\(['"]([\s\S]*?)['"]\)/);
  if (!match) return [];

  // Unescape the HTML string from JS string literal form
  const html = match[1]
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');

  const results: ParsedSymbol[] = [];

  for (const id of requestedIds) {
    const name = SYMBOL_NAMES[id];
    if (!name) continue;

    // Try to find a row containing this symbol name; pull all percentage and number tokens
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rowMatch = new RegExp(
      `${escapedName}[\\s\\S]{0,2000}?(?=${Object.values(SYMBOL_NAMES).slice(0, 50).map(s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')}|$)`,
      'i'
    ).exec(html);

    if (!rowMatch) continue;
    const row = rowMatch[0];

    // Long/Short percentages (look for two consecutive % values)
    const pcts = [...row.matchAll(/(\d{1,3}(?:\.\d+)?)\s*%/g)].map((m) => parseFloat(m[1]));
    if (pcts.length < 2) continue;

    const longPct = pcts[0];
    const shortPct = pcts[1];

    // Numeric values for lots / positions / prices (best effort)
    const numbers = [...row.matchAll(/>([\d,]+(?:\.\d+)?)</g)]
      .map((m) => parseFloat(m[1].replace(/,/g, '')))
      .filter((n) => !isNaN(n));

    results.push({
      id,
      name,
      longPct,
      shortPct,
      longLots: numbers[2],
      shortLots: numbers[3],
      longPositions: numbers[4] ? Math.round(numbers[4]) : undefined,
      shortPositions: numbers[5] ? Math.round(numbers[5]) : undefined,
      longPrice: numbers[6],
      shortPrice: numbers[7],
    });
  }

  return results;
}

/** Generate a deterministic plausible mock so the UI is never empty. */
function fallbackData(requestedIds: number[]): ParsedSymbol[] {
  return requestedIds.map((id) => {
    const seed = id * 9301 + 49297;
    const r = Math.abs(Math.sin(seed) * 10000) % 1;
    const longPct = Math.round(20 + r * 60);
    return {
      id,
      name: SYMBOL_NAMES[id] ?? `#${id}`,
      longPct,
      shortPct: 100 - longPct,
      longLots: Math.round(500 + r * 5000),
      shortLots: Math.round(500 + (1 - r) * 5000),
      longPositions: Math.round(50 + r * 800),
      shortPositions: Math.round(50 + (1 - r) * 800),
      drawdown: Math.round(r * 200),
    };
  });
}

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get('symbols') ?? '1,2,3,4,5,6,7,34';
  const ids = symbolsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  let data: ParsedSymbol[] = [];
  let source: 'myfxbook' | 'fallback' = 'fallback';

  try {
    const url = `https://widgets.myfxbook.com/scripts/fxOutlook.js?type=2&symbols=,${ids.join(',')}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Referer: 'https://www.myfxbook.com/',
      },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const text = await res.text();
      const parsed = parseMyfxbookScript(text, ids);
      if (parsed.length > 0) {
        data = parsed;
        source = 'myfxbook';
      }
    }
  } catch {
    // swallow — fall back below
  }

  if (data.length === 0) {
    data = fallbackData(ids);
  }

  return Response.json({
    data,
    meta: { source, count: data.length, ts: Date.now() },
  });
}
