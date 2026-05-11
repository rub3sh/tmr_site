export type AccessPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type IndicatorTier = 'CORE' | 'SMT' | 'SUITE';

export function getAccessExpiry(period: AccessPeriod): Date {
  const d = new Date();
  if (period === 'MONTHLY') d.setMonth(d.getMonth() + 1);
  else if (period === 'QUARTERLY') d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export type TierPricingRecord = {
  tier: IndicatorTier;
  label: string;
  description: string;
  monthly: number;
  quarterly: number;
  annual: number;
  features: string[];
  isActive: boolean;
};
