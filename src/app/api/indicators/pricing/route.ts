import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tiers = await prisma.indicatorTierPricing.findMany({
    where: { isActive: true },
    orderBy: { tier: 'asc' },
  });
  return NextResponse.json({ data: tiers });
}
