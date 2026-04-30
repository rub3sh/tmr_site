import { NextResponse } from 'next/server';
import { getForexFactoryEvents } from '@/lib/forex-factory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const hasFilter = Number.isInteger(month) && month >= 1 && month <= 12
      && Number.isInteger(year) && year >= 2000 && year <= 2100;

    const forexEvents = (await getForexFactoryEvents()).filter((event) => {
      if (!hasFilter) return true;
      const d = new Date(event.startTime);
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    });

    return NextResponse.json(
      { success: true, data: forexEvents, meta: { forexCoverage: 'TWO_WEEKS' } },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    );
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
