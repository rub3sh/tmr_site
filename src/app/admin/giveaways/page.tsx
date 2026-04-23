import { prisma } from '@/lib/prisma';
import { GiveawaysClient } from '@/components/admin/giveaways-client';

async function getGiveaways() {
  return prisma.giveaway.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminGiveawaysPage() {
  let giveaways: Awaited<ReturnType<typeof getGiveaways>> = [];
  try {
    giveaways = await getGiveaways();
  } catch {
    // DB not ready
  }

  return <GiveawaysClient initialGiveaways={JSON.parse(JSON.stringify(giveaways))} />;
}
