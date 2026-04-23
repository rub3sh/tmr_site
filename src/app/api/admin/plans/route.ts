import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ success: true, data: plans });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, priceMonthly, priceYearly, features, discordRoleId } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existingPlans = await prisma.plan.count();

  const plan = await prisma.plan.create({
    data: {
      name,
      slug,
      description: description || null,
      priceMonthly: priceMonthly || 0,
      priceYearly: priceYearly || 0,
      features: features || [],
      discordRoleId: discordRoleId || null,
      sortOrder: existingPlans,
    },
  });

  return NextResponse.json({ success: true, data: plan });
}
