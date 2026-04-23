import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { giveawayId: string };
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.giveawayEntry.deleteMany({ where: { giveawayId: params.giveawayId } });
  await prisma.giveaway.delete({ where: { id: params.giveawayId } });
  return NextResponse.json({ success: true });
}
