import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const giveaways = await prisma.giveaway.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: giveaways });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, prize, rules, startsAt, endsAt, maxEntries } = await req.json();

  if (!title || !prize || !startsAt || !endsAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const giveaway = await prisma.giveaway.create({
    data: {
      title, description: description || '',
      prize, rules: rules || [],
      startsAt: new Date(startsAt), endsAt: new Date(endsAt),
      maxEntries: maxEntries || null,
      status: new Date(startsAt) > new Date() ? 'UPCOMING' : 'ACTIVE',
    },
  });

  return NextResponse.json({ success: true, data: giveaway });
}
