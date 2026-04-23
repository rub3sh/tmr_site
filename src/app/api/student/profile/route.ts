import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, studentId: true,
      verificationStatus: true, image: true, discordUsername: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Subscription
  const activeSub = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: 'ACTIVE' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  // Stats
  const [coursesAccessed, videoProgress, leaderboardEntry] = await Promise.all([
    prisma.purchase.count({ where: { userId: session.user.id, status: 'COMPLETED' } }),
    prisma.videoProgress.findMany({
      where: { userId: session.user.id },
      select: { completed: true, watchedSec: true },
    }),
    prisma.leaderboardEntry.findFirst({
      where: { userId: session.user.id },
      orderBy: { weekOf: 'desc' },
    }),
  ]);

  const videosCompleted = videoProgress.filter((p) => p.completed).length;
  const totalWatchSec = videoProgress.reduce((s, p) => s + p.watchedSec, 0);

  // Leaderboard rank
  let leaderboardRank: number | null = null;
  if (leaderboardEntry) {
    const higherScores = await prisma.leaderboardEntry.count({
      where: { weekOf: leaderboardEntry.weekOf, score: { gt: leaderboardEntry.score } },
    });
    leaderboardRank = higherScores + 1;
  }

  // Discord invite
  let discordInvite: string | null = null;
  if (activeSub) {
    const link = await prisma.discordLink.findFirst({
      where: { userId: session.user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (link) {
      discordInvite = `https://discord.gg/${link.inviteCode}`;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      user,
      subscription: activeSub
        ? {
            planName: activeSub.plan.name,
            status: activeSub.status,
            billingCycle: activeSub.billingCycle,
            currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
          }
        : null,
      stats: {
        coursesAccessed,
        videosCompleted,
        totalWatchHours: Math.round(totalWatchSec / 3600),
        leaderboardRank,
      },
      discordInvite,
    },
  });
}
