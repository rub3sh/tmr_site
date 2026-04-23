import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const indicators = await prisma.indicator.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Check user's plan access
  const userSubs = await prisma.subscription.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: { planId: true },
  });
  const userPlanIds = new Set(userSubs.map((s) => s.planId));

  const data = indicators.map((ind) => {
    const hasAccess = ind.isPublic || ind.planIds.some((pid) => userPlanIds.has(pid));
    return {
      ...ind,
      script: hasAccess ? ind.script : null,
      strategy: hasAccess ? ind.strategy : null,
      hasAccess,
    };
  });

  return NextResponse.json({ success: true, data });
}
