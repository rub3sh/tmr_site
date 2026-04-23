'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Gift, Clock, Users, CheckCircle, Trophy } from 'lucide-react';

interface GiveawayData {
  id: string;
  title: string;
  description: string;
  prize: string;
  rules: string[];
  imageUrl: string | null;
  status: string;
  maxEntries: number | null;
  startsAt: string;
  endsAt: string;
  winnerId: string | null;
  _count?: { entries: number };
  hasEntered?: boolean;
}

export default function StudentGiveawaysPage() {
  const { data: session } = useSession();
  const [giveaways, setGiveaways] = useState<GiveawayData[]>([]);
  const [entering, setEntering] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/giveaways')
      .then((r) => r.json())
      .then((d) => { if (d.data) setGiveaways(d.data); })
      .catch(() => {});
  }, []);

  async function enterGiveaway(giveawayId: string): Promise<void> {
    setEntering(giveawayId);
    try {
      const res = await fetch(`/api/giveaways/${giveawayId}/enter`, { method: 'POST' });
      if (res.ok) {
        setGiveaways((prev) =>
          prev.map((g) =>
            g.id === giveawayId
              ? { ...g, hasEntered: true, _count: { entries: (g._count?.entries ?? 0) + 1 } }
              : g
          )
        );
      }
    } finally {
      setEntering(null);
    }
  }

  const active = giveaways.filter((g) => g.status === 'ACTIVE');
  const upcoming = giveaways.filter((g) => g.status === 'UPCOMING');
  const ended = giveaways.filter((g) => g.status === 'ENDED');

  function GiveawayCard({ giveaway }: { giveaway: GiveawayData }) {
    const isActive = giveaway.status === 'ACTIVE';
    const hasEntered = giveaway.hasEntered;
    const isFull = giveaway.maxEntries ? (giveaway._count?.entries ?? 0) >= giveaway.maxEntries : false;
    const timeLeft = new Date(giveaway.endsAt).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition hover:border-white/10">
        {giveaway.imageUrl && (
          <div className="aspect-video w-full overflow-hidden bg-white/5">
            <img src={giveaway.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{giveaway.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isActive ? 'bg-green-500/10 text-green-400' : giveaway.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/30'
            }`}>
              {giveaway.status}
            </span>
          </div>

          <p className="text-sm text-white/40">{giveaway.description}</p>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-xs text-white/25">Prize</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{giveaway.prize}</p>
          </div>

          {giveaway.rules.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-white/25">Rules</p>
              {giveaway.rules.map((rule, i) => (
                <p key={i} className="text-xs text-white/35">• {rule}</p>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-white/20">
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{giveaway._count?.entries ?? 0} entries</span>
            </div>
            {isActive && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{daysLeft} days left</span>
              </div>
            )}
          </div>

          {isActive && !hasEntered && !isFull && (
            <button
              onClick={() => enterGiveaway(giveaway.id)}
              disabled={entering === giveaway.id}
              className="w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {entering === giveaway.id ? 'Entering...' : 'Enter Giveaway'}
            </button>
          )}
          {hasEntered && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 py-3">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">Entered</span>
            </div>
          )}
          {isFull && !hasEntered && (
            <div className="rounded-lg bg-white/[0.03] py-3 text-center text-sm text-white/30">
              Entries Full
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Giveaways</h1>
        <p className="mt-1 text-sm text-white/40">Exclusive prizes and promotions</p>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-green-400/60">Active</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {active.map((g) => <GiveawayCard key={g.id} giveaway={g} />)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-400/60">Upcoming</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {upcoming.map((g) => <GiveawayCard key={g.id} giveaway={g} />)}
          </div>
        </div>
      )}

      {/* Ended */}
      {ended.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/20">Past</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {ended.map((g) => <GiveawayCard key={g.id} giveaway={g} />)}
          </div>
        </div>
      )}

      {giveaways.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <Gift size={48} className="text-white/10" />
          <p className="mt-4 text-sm text-white/30">No giveaways available right now</p>
        </div>
      )}
    </div>
  );
}
