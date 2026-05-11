import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tierSchema = z.object({
  tier: z.enum(['CORE', 'SMT', 'SUITE']),
  label: z.string().min(1),
  description: z.string().default(''),
  monthly: z.number().int().min(0),
  quarterly: z.number().int().min(0),
  annual: z.number().int().min(0),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tiers = await prisma.indicatorTierPricing.findMany({ orderBy: { tier: 'asc' } });
  return NextResponse.json({ data: tiers });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = tierSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  const { tier, ...data } = parsed.data;

  const record = await prisma.indicatorTierPricing.upsert({
    where: { tier },
    create: { tier, ...data },
    update: data,
  });

  return NextResponse.json({ data: record });
}
