import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { studentId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId, billingCycle } = await req.json();

  if (!planId) {
    // Remove subscription — downgrade to free
    await prisma.subscription.updateMany({
      where: { userId: params.studentId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });
    return NextResponse.json({ success: true, data: null });
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  // Cancel any existing active subscription
  await prisma.subscription.updateMany({
    where: { userId: params.studentId, status: 'ACTIVE' },
    data: { status: 'CANCELLED' },
  });

  // Create new subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: params.studentId,
      planId,
      status: 'ACTIVE',
      billingCycle: billingCycle || 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000),
    },
    include: { plan: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, data: subscription });
}
