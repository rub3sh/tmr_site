import { NextRequest } from 'next/server';

export const revalidate = 300;

interface FngRow { value: string; value_classification: string; timestamp: string }
interface CoinRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  ath: number;
  ath_change_percentage: number;
  high_24h: number;
  low_24h: number;
}
interface GlobalData {
  total_market_cap?: { usd: number };
  total_volume?: { usd: number };
  market_cap_percentage?: Record<string, number>;
  market_cap_change_percentage_24h_usd?: number;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 300 }, headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const [fng, coins, global] = await Promise.all([
    fetchJson<{ data: FngRow[] }>('https://api.alternative.me/fng/?limit=30'),
    fetchJson<CoinRow[]>(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=true&price_change_percentage=24h,7d,30d'
    ),
    fetchJson<{ data: GlobalData }>('https://api.coingecko.com/api/v3/global'),
  ]);

  return Response.json({
    fearGreed: fng?.data ?? null,
    coins: coins ?? null,
    global: global?.data ?? null,
    meta: { ts: Date.now() },
  });
}
