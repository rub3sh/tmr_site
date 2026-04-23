import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await prisma.leaderboardEntry.findMany({
    include: {
      user: { select: { name: true, email: true, image: true, studentId: true } },
    },
    orderBy: { score: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: entries });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, score, profitPercent, consistency, completionScore } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const entry = await prisma.leaderboardEntry.upsert({
    where: { userId_weekOf: { userId, weekOf: weekStart } },
    update: { score, profitPercent, consistency, completionScore },
    create: { userId, score, profitPercent, consistency, completionScore, weekOf: weekStart },
  });

  return NextResponse.json({ success: true, data: entry });
}
