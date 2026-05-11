import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { grantAccessToAllTierScripts } from '@/lib/tradingview';
import { z } from 'zod';

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const purchase = await prisma.indicatorPurchase.findUnique({
      where: { razorpayOrderId },
    });

    if (!purchase || purchase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Mark payment completed first so the user isn't left in limbo
    await prisma.indicatorPurchase.update({
      where: { razorpayOrderId },
      data: { razorpayPaymentId, razorpaySignature, status: 'COMPLETED' },
    });

    // Grant TradingView access for all eligible scripts
    const indicators = await prisma.indicator.findMany({
      where: { tradingViewScriptId: { not: null } },
      select: { tradingViewScriptId: true, tier: true },
    });

    const { granted, failed } = await grantAccessToAllTierScripts(
      purchase.tradingViewUsername,
      purchase.tier,
      purchase.accessExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      indicators,
    );

    await prisma.indicatorPurchase.update({
      where: { razorpayOrderId },
      data: { tvAccessGranted: granted > 0 },
    });

    if (failed > 0) {
      console.warn(`[IndicatorPurchase] ${failed} script(s) failed to grant for ${purchase.tradingViewUsername}`);
    }

    return NextResponse.json({
      success: true,
      accessExpiresAt: purchase.accessExpiresAt,
      tradingViewUsername: purchase.tradingViewUsername,
      tvAccessGranted: granted > 0,
    });
  } catch (error) {
    console.error('[IndicatorPurchase] verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
