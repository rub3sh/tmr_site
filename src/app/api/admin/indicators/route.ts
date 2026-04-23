import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const indicators = await prisma.indicator.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: indicators });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, script, strategy, imageUrl, isPublic, planIds } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const indicator = await prisma.indicator.create({
    data: {
      name, slug, description: description || '',
      script: script || null, strategy: strategy || null,
      imageUrl: imageUrl || null, isPublic: isPublic ?? false,
      planIds: planIds || [],
    },
  });

  return NextResponse.json({ success: true, data: indicator });
}
