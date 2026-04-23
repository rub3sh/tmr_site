import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { planId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const plan = await prisma.plan.update({
    where: { id: params.planId },
    data: body,
  });

  return NextResponse.json({ success: true, data: plan });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.planCourse.deleteMany({ where: { planId: params.planId } });
  await prisma.subscription.deleteMany({ where: { planId: params.planId } });
  await prisma.plan.delete({ where: { id: params.planId } });

  return NextResponse.json({ success: true });
}
