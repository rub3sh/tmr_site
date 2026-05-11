'use client';

import React, { useState } from 'react';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PricingCardProps = {
  titleBadge: string;
  subtitle?: string;
  priceLabel: string;
  billingLabel: string;
  features: string[];
  cta?: string;
  className?: string;
  highlight?: boolean;
  onCtaClick?: () => void;
};

function FilledCheck() {
  return (
    <div className="rounded-full bg-[var(--accent)] p-0.5 text-black">
      <CheckIcon className="size-3" strokeWidth={3} />
    </div>
  );
}

function PricingCard({
  titleBadge,
  subtitle,
  priceLabel,
  billingLabel,
  features,
  cta = 'Choose Plan',
  className,
  highlight = false,
  onCtaClick,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border bg-[#090909] backdrop-blur',
        'border-white/10',
        highlight && 'border-[var(--accent)]/60 shadow-[0_0_0_1px_rgba(79,123,247,0.35),0_20px_50px_rgba(79,123,247,0.15)]',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
        <Badge variant={highlight ? 'default' : 'secondary'}>{titleBadge}</Badge>
        {highlight && (
          <Badge variant="outline" className="shrink-0">
            <SparklesIcon className="me-1 size-3" /> Best Buy
          </Badge>
        )}
        <div className="w-full sm:ml-auto sm:w-auto">
          <Button variant={highlight ? 'default' : 'outline'} size="sm" onClick={onCtaClick}>
            {cta}
          </Button>
        </div>
      </div>

      <div className="flex items-end gap-2 px-4 py-2">
        <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight md:text-5xl">{priceLabel}</span>
        <span className="text-sm text-white/45">/{billingLabel}</span>
      </div>

      {subtitle ? <p className="px-4 text-sm font-medium text-white/70">{subtitle}</p> : null}

      <ul className="grid gap-4 p-4 text-sm text-white/60">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <FilledCheck />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type BentoPricingProps = {
  mode?: 'default' | 'indicators';
};

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

const BILLING_OPTIONS: Array<{ label: string; value: BillingCycle }> = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: 'month',
  quarterly: 'quarter',
  yearly: 'year',
};

const INDICATOR_PRICES = {
  core: {
    monthly: '$20',
    quarterly: '$54',
    yearly: '$192',
  },
  smt: {
    monthly: '$22',
    quarterly: '$60',
    yearly: '$216',
  },
  suite: {
    monthly: '$59',
    quarterly: '$159',
    yearly: '$540',
  },
} as const;

const MONTHLY_EQUIVALENT: Record<BillingCycle, string> = {
  monthly: 'Billed monthly',
  quarterly: 'Billed quarterly',
  yearly: 'Billed yearly',
};

export function BentoPricing({ mode = 'default' }: BentoPricingProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const { data: session } = useSession();
  const router = useRouter();

  function handlePurchaseCta() {
    if (session) {
      router.push('/indicators/purchase');
    } else {
      signIn('discord', { callbackUrl: '/indicators/purchase' });
    }
  }

  const handleBillingToggleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const lastIndex = BILLING_OPTIONS.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    setBillingCycle(BILLING_OPTIONS[nextIndex].value);
    const radioGroup = event.currentTarget.parentElement;
    const options = radioGroup?.querySelectorAll('button[role="radio"]');
    const nextButton = options?.item(nextIndex);
    if (nextButton instanceof HTMLButtonElement) {
      nextButton.focus();
    }
  };

  if (mode === 'indicators') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div
            role="radiogroup"
            aria-label="Pricing billing cycle"
            className="inline-flex rounded-full border border-white/10 bg-[#0e0e0e] p-1"
          >
            {BILLING_OPTIONS.map((option, index) => {
              const isActive = billingCycle === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setBillingCycle(option.value)}
                  onKeyDown={(event) => handleBillingToggleKeyDown(event, index)}
                  className={cn(
                    'rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.08em] transition-all md:text-sm',
                    isActive
                      ? 'bg-[var(--accent)] text-black shadow-[0_0_24px_var(--accent-glow)]'
                      : 'text-white/65 hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
          <PricingCard
            titleBadge="QUANTUM CORE SUITE"
            subtitle="Essential execution tools"
            priceLabel={INDICATOR_PRICES.core[billingCycle]}
            billingLabel={BILLING_LABELS[billingCycle]}
            cta="Choose Core"
            onCtaClick={handlePurchaseCta}
            features={[
              MONTHLY_EQUIVALENT[billingCycle],
              'Core execution framework access',
            ]}
            className="lg:col-span-3"
          />

          <PricingCard
            titleBadge="QUANTUM SMT ACCESS"
            subtitle="Focused SMT detection for precision entries"
            priceLabel={INDICATOR_PRICES.smt[billingCycle]}
            billingLabel={BILLING_LABELS[billingCycle]}
            cta="Choose SMT"
            onCtaClick={handlePurchaseCta}
            features={[
              MONTHLY_EQUIVALENT[billingCycle],
              'Quantum SMT Engine only',
              'Discord alerts (SMT)',
              'Upgrade to full suite for complete system access',
            ]}
            className="lg:col-span-5"
          />

          <PricingCard
            titleBadge="QUANTUM SUITE"
            subtitle="Full system with time and SMT precision"
            priceLabel={INDICATOR_PRICES.suite[billingCycle]}
            billingLabel={BILLING_LABELS[billingCycle]}
            cta="Choose Full Suite"
            onCtaClick={handlePurchaseCta}
            highlight
            features={[
              MONTHLY_EQUIVALENT[billingCycle],
              'Everything in Core',
              'Quantum SMT Engine',
              'Quantum Algo Clock (GB Time)',
              'Best value: includes SMT + Algo Time + all tools',
            ]}
            className="md:col-span-2 lg:col-span-8"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
      <PricingCard
        titleBadge="FREE STARTER"
        priceLabel="Free"
        billingLabel="free starter"
        cta="Start Free"
        features={[
          'Get started with core market education',
          'Access selected newsletter briefings',
          'Perfect for new traders building consistency',
        ]}
        className="lg:col-span-3"
      />

      <PricingCard
        titleBadge="MONTHLY"
        priceLabel="$29"
        billingLabel="month"
        features={[
          'Full mentorship dashboard access',
          'Weekly strategy updates and review notes',
          'Indicator setup guidance and support',
        ]}
        className="lg:col-span-5"
      />

      <PricingCard
        titleBadge="QUARTERLY"
        priceLabel="$69"
        billingLabel="quarter"
        cta="Choose Best Buy"
        features={[
          'Everything in Monthly with bigger savings',
          'Priority Q&A and trade plan feedback',
          'Best value for focused traders scaling up',
        ]}
        highlight
        className="lg:col-span-5"
      />

      <PricingCard
        titleBadge="ANNUAL"
        priceLabel="$249"
        billingLabel="year"
        features={[
          'Maximum savings for committed traders',
          'Long-term roadmap with private checkpoints',
          'Quarterly strategy reset sessions included',
        ]}
        className="lg:col-span-3"
      />
    </div>
  );
}
