import { prisma } from '@/lib/prisma';
import { IndicatorsClient } from '@/components/admin/indicators-client';

async function getIndicators() {
  return prisma.indicator.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminIndicatorsPage() {
  let indicators: Awaited<ReturnType<typeof getIndicators>> = [];
  try {
    indicators = await getIndicators();
  } catch {
    // DB not ready
  }

  return <IndicatorsClient initialIndicators={JSON.parse(JSON.stringify(indicators))} />;
}
