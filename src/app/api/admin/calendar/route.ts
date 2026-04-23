import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const events = await prisma.calendarEvent.findMany({
    orderBy: { startTime: 'desc' },
  });

  return NextResponse.json({ success: true, data: events });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, eventType, startTime, endTime, isPublic } = await req.json();

  if (!title || !startTime) {
    return NextResponse.json({ error: 'Title and startTime required' }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: description || null,
      eventType: eventType || 'LIVE_SESSION',
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      isPublic: isPublic ?? true,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: event });
}
