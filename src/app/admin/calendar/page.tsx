import { prisma } from '@/lib/prisma';
import { CalendarClient } from '@/components/admin/calendar-client';

async function getEvents() {
  return prisma.calendarEvent.findMany({
    orderBy: { startTime: 'asc' },
  });
}

export default async function AdminCalendarPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch {
    // DB not ready
  }

  return <CalendarClient initialEvents={JSON.parse(JSON.stringify(events))} />;
}
