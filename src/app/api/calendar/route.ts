import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getForexFactoryEvents } from '@/lib/forex-factory';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const hasValidMonthFilter = Number.isInteger(month) && month >= 1 && month <= 12
      && Number.isInteger(year) && year >= 2000 && year <= 2100;

    const monthStart = hasValidMonthFilter
      ? new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
      : null;
    const nextMonthStart = hasValidMonthFilter
      ? new Date(Date.UTC(year, month, 1, 0, 0, 0))
      : null;

    const events = await prisma.calendarEvent.findMany({
      where: {
        isPublic: true,
        ...(hasValidMonthFilter && monthStart && nextMonthStart
          ? { startTime: { gte: monthStart, lt: nextMonthStart } }
          : {}),
      },
      orderBy: { startTime: 'asc' },
      select: {
        id: true, title: true, description: true,
        eventType: true, startTime: true, endTime: true,
      },
    });

    const forexEvents = (await getForexFactoryEvents())
      .filter((event) => {
        if (!hasValidMonthFilter) {
          return true;
        }

        const date = new Date(event.startTime);
        return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
      });

    const mergedEvents = [...events, ...forexEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json({
      success: true,
      data: mergedEvents,
      meta: {
        forexCoverage: 'TWO_WEEKS',
      },
    });
  } catch (error) {
    console.error('Calendar API failed', error);
    return NextResponse.json({ success: false, error: 'Failed to load calendar events' }, { status: 500 });
  }
}
