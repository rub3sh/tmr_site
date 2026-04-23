import { prisma } from '@/lib/prisma';
import { LeaderboardClient } from '@/components/admin/leaderboard-client';

async function getEntries() {
  return prisma.leaderboardEntry.findMany({
    include: {
      user: { select: { name: true, email: true, image: true, studentId: true } },
    },
    orderBy: { score: 'desc' },
  });
}

export default async function AdminLeaderboardPage() {
  let entries: Awaited<ReturnType<typeof getEntries>> = [];
  try {
    entries = await getEntries();
  } catch {
    // DB not ready
  }

  return <LeaderboardClient initialEntries={JSON.parse(JSON.stringify(entries))} />;
}
