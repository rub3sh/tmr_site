'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  slug: string;
}

export function DevPlanToggle({ plans, activePlanSlug }: { plans: Plan[]; activePlanSlug: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (process.env.NODE_ENV !== 'development') return null;

  const current = searchParams.get('plan') ?? activePlanSlug;

  function setPlan(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('plan', slug);
    } else {
      params.delete('plan');
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-yellow-500/10 bg-yellow-500/[0.03] px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-yellow-500/50">Dev View</span>
      <div className="flex gap-1">
        <button
          onClick={() => setPlan(null)}
          className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
            !current ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
          }`}
        >
          Free
        </button>
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setPlan(plan.slug)}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
              current === plan.slug ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            {plan.name}
          </button>
        ))}
      </div>
    </div>
  );
}
