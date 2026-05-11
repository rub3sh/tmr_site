import { prisma } from '@/lib/prisma';
import { IndicatorsClient } from '@/components/admin/indicators-client';

async function getData() {
  const [indicators, tierPricing] = await Promise.all([
    prisma.indicator.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.indicatorTierPricing.findMany({ orderBy: { tier: 'asc' } }),
  ]);
  return { indicators, tierPricing };
}

export default async function AdminIndicatorsPage() {
  let indicators: Awaited<ReturnType<typeof getData>>['indicators'] = [];
  let tierPricing: Awaited<ReturnType<typeof getData>>['tierPricing'] = [];

  try {
    const data = await getData();
    indicators = data.indicators;
    tierPricing = data.tierPricing;
  } catch {
    // DB not ready
  }

  return (
    <IndicatorsClient
      initialIndicators={JSON.parse(JSON.stringify(indicators))}
      initialTierPricing={JSON.parse(JSON.stringify(tierPricing))}
    />
  );
}
