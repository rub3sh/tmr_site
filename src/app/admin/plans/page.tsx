import { prisma } from '@/lib/prisma';
import { PlansClient } from '@/components/admin/plans-client';

async function getPlans() {
  return prisma.plan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function AdminPlansPage() {
  let plans: Awaited<ReturnType<typeof getPlans>> = [];
  try {
    plans = await getPlans();
  } catch {
    // DB not ready
  }

  return <PlansClient initialPlans={JSON.parse(JSON.stringify(plans))} />;
}
