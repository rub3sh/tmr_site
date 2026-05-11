import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { indicatorId: string };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, script, strategy, imageUrl, isPublic, planIds, tier, tradingViewScriptId } = await req.json();

  const slug = name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const indicator = await prisma.indicator.update({
    where: { id: params.indicatorId },
    data: {
      ...(name && { name, slug }),
      ...(description !== undefined && { description }),
      ...(script !== undefined && { script: script || null }),
      ...(strategy !== undefined && { strategy: strategy || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(isPublic !== undefined && { isPublic }),
      ...(planIds !== undefined && { planIds }),
      ...(tier && { tier }),
      ...(tradingViewScriptId !== undefined && { tradingViewScriptId: tradingViewScriptId || null }),
    },
  });

  return NextResponse.json({ success: true, data: indicator });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.indicator.delete({ where: { id: params.indicatorId } });
  return NextResponse.json({ success: true });
}
