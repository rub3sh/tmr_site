import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tiers = await prisma.indicatorTierPricing.findMany({
    where: { isActive: true },
    orderBy: { tier: 'asc' },
  });
  return NextResponse.json({ data: tiers });
}
