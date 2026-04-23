import { prisma } from '@/lib/prisma';
import { CouponsClient } from '@/components/admin/coupons-client';

async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminCouponsPage() {
  let coupons: Awaited<ReturnType<typeof getCoupons>> = [];
  try {
    coupons = await getCoupons();
  } catch {
    // DB not ready
  }

  return <CouponsClient initialCoupons={JSON.parse(JSON.stringify(coupons))} />;
}
