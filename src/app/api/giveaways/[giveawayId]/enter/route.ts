import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: { giveawayId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: { id: params.giveawayId },
    include: { _count: { select: { entries: true } } },
  });

  if (!giveaway || giveaway.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Giveaway not active' }, { status: 400 });
  }

  if (giveaway.maxEntries && giveaway._count.entries >= giveaway.maxEntries) {
    return NextResponse.json({ error: 'Giveaway is full' }, { status: 400 });
  }

  const existing = await prisma.giveawayEntry.findUnique({
    where: { giveawayId_userId: { giveawayId: params.giveawayId, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: 'Already entered' }, { status: 400 });
  }

  const entry = await prisma.giveawayEntry.create({
    data: { giveawayId: params.giveawayId, userId: session.user.id },
  });

  return NextResponse.json({ success: true, data: entry });
}
