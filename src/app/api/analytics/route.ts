import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [totalUsers, purchases, progressData] = await Promise.all([
      prisma.user.count(),
      prisma.purchase.findMany({
        where: { status: 'COMPLETED' },
        select: { amountInPaise: true, courseId: true },
      }),
      prisma.videoProgress.aggregate({
        _sum: { watchedSec: true },
        _count: { completed: true },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalRevenue: purchases.reduce((s, p) => s + p.amountInPaise, 0),
      totalPurchases: purchases.length,
      totalWatchTimeSec: progressData._sum.watchedSec || 0,
      completedVideos: progressData._count.completed || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
