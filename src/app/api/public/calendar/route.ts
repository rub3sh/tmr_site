import { NextResponse } from 'next/server';
import { getEconomicCalendarEvents } from '@/lib/economic-calendar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const now = new Date();
    const y = Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : now.getUTCFullYear();
    const m = Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getUTCMonth() + 1;

    const events = await getEconomicCalendarEvents(y, m);
    const source = process.env.FINNHUB_API_KEY ? 'finnhub' : 'forex_factory';

    return NextResponse.json(
      { success: true, data: events, meta: { source } },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
