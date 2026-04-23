'use client';

interface Stat {
  label: string;
  value: string;
}

export function AnalyticsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-black-900 border border-white/10 p-5 hover:border-primary/20 transition-all"
        >
          <p className="text-xs text-white/30 uppercase tracking-wider">{stat.label}</p>
          <p className="text-2xl font-heading font-bold mt-1 text-gradient-accent">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
