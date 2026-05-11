import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEconomicCalendarEvents } from '@/lib/economic-calendar';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const now = new Date();
    const y = Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : now.getUTCFullYear();
    const m = Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getUTCMonth() + 1;

    const monthStart = new Date(Date.UTC(y, m - 1, 1));
    const nextMonthStart = new Date(Date.UTC(y, m, 1));

    const [dbEvents, econEvents] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: { isPublic: true, startTime: { gte: monthStart, lt: nextMonthStart } },
        orderBy: { startTime: 'asc' },
        select: { id: true, title: true, description: true, eventType: true, startTime: true, endTime: true },
      }),
      getEconomicCalendarEvents(y, m),
    ]);

    const mappedEcon = econEvents.map((e) => ({
      id: e.id,
      title: e.title,
      shortTitle: e.shortTitle,
      description: [
        e.country ? `Country: ${e.country}` : null,
        e.estimate ? `Forecast: ${e.estimate}` : null,
        e.previous ? `Previous: ${e.previous}` : null,
        e.actual ? `Actual: ${e.actual}` : null,
      ].filter(Boolean).join(' | ') || null,
      eventType: 'ECONOMIC_NEWS',
      startTime: e.startTime,
      endTime: null,
      impactLevel: e.impact,
      country: e.country,
      currency: e.currency,
    }));

    const merged = [...dbEvents.map((e) => ({ ...e, startTime: e.startTime.toISOString(), endTime: e.endTime?.toISOString() ?? null })), ...mappedEcon]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const source = process.env.FINNHUB_API_KEY ? 'finnhub' : 'forex_factory';
    return NextResponse.json({ success: true, data: merged, meta: { source } });
  } catch (error) {
    console.error('Calendar API failed', error);
    return NextResponse.json({ success: false, error: 'Failed to load calendar events' }, { status: 500 });
  }
}
