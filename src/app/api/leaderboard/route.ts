import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'weekly';
  const now = new Date();

  let dateFilter: Date | undefined;
  if (type === 'weekly') {
    dateFilter = new Date(now);
    dateFilter.setDate(now.getDate() - 7);
  } else if (type === 'monthly') {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 1);
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: dateFilter ? { weekOf: { gte: dateFilter } } : undefined,
    include: {
      user: { select: { name: true, email: true, image: true, studentId: true } },
    },
    orderBy: { score: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, data: entries });
}
