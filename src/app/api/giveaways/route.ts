import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const giveaways = await prisma.giveaway.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Check if user has entered each
  const userEntries = await prisma.giveawayEntry.findMany({
    where: { userId: session.user.id },
    select: { giveawayId: true },
  });
  const enteredIds = new Set(userEntries.map((e) => e.giveawayId));

  const data = giveaways.map((g) => ({
    ...g,
    hasEntered: enteredIds.has(g.id),
  }));

  return NextResponse.json({ success: true, data });
}
