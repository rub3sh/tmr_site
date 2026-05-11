import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
import { getAccessExpiry, type AccessPeriod } from '@/lib/indicator-pricing';
import { z } from 'zod';

const schema = z.object({
  tier: z.enum(['CORE', 'SMT', 'SUITE']),
  accessPeriod: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  tradingViewUsername: z.string().min(1).max(100).trim(),
});

const PERIOD_FIELD: Record<AccessPeriod, 'monthly' | 'quarterly' | 'annual'> = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { tier, accessPeriod, tradingViewUsername } = parsed.data;
    const userId = session.user.id;

    // Fetch pricing from DB
    const pricing = await prisma.indicatorTierPricing.findUnique({
      where: { tier: tier as 'CORE' | 'SMT' | 'SUITE' },
    });

    if (!pricing || !pricing.isActive) {
      return NextResponse.json({ error: 'This plan is not currently available' }, { status: 404 });
    }

    const amountInPaise = pricing[PERIOD_FIELD[accessPeriod as AccessPeriod]];

    if (!amountInPaise || amountInPaise <= 0) {
      return NextResponse.json({ error: 'Pricing not configured for this period' }, { status: 400 });
    }

    const accessExpiresAt = getAccessExpiry(accessPeriod as AccessPeriod);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `ind_${userId.slice(-8)}_${Date.now()}`,
    });

    await prisma.indicatorPurchase.create({
      data: {
        userId,
        tier: tier as 'CORE' | 'SMT' | 'SUITE',
        tradingViewUsername,
        accessPeriod: accessPeriod as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
        razorpayOrderId: order.id,
        amountInPaise,
        currency: 'INR',
        status: 'PENDING',
        accessExpiresAt,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planLabel: pricing.label,
    });
  } catch (error) {
    console.error('[IndicatorPurchase] create-order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
