'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  profitPercent: number;
  consistency: number;
  completionScore: number;
  weekOf: string;
  user: { name: string | null; email: string; image: string | null; studentId: string | null };
}

type Tab = 'weekly' | 'monthly' | 'alltime';

export default function StudentLeaderboardsPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<Tab>('weekly');

  useEffect(() => {
    fetch(`/api/leaderboard?type=${tab}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setEntries(d.data); })
      .catch(() => {});
  }, [tab]);

  const currentUserRank = entries.findIndex((e) => e.userId === session?.user.id) + 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Leaderboards</h1>
        <p className="mt-1 text-sm text-white/40">See how you rank among traders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'weekly' as const, label: 'Weekly' },
          { key: 'monthly' as const, label: 'Monthly' },
          { key: 'alltime' as const, label: 'All Time' },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            tab === t.key ? 'bg-white text-black' : 'bg-white/[0.03] text-white/30 hover:bg-white/5 hover:text-white/50'
          }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Your rank */}
      {currentUserRank > 0 && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-transparent p-5">
          <p className="text-xs text-white/30">Your Rank</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-white">#{currentUserRank}</span>
            <span className="text-sm text-white/40">of {entries.length}</span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isCurrentUser = entry.userId === session?.user.id;
          const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                isCurrentUser
                  ? 'border-white/15 bg-white/[0.05]'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.03]'
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {i < 3 ? (
                  <span className={`text-lg font-bold ${rankColors[i]}`}>
                    {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-white/30">#{i + 1}</span>
                )}
              </div>

              {/* User */}
              <div className="flex flex-1 items-center gap-3">
                {entry.user.image ? (
                  <img src={entry.user.image} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-medium text-white/40">
                    {entry.user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
                <div>
                  <p className={`text-sm font-medium ${isCurrentUser ? 'text-white' : 'text-white/70'}`}>
                    {entry.user.name ?? 'Anonymous'}
                    {isCurrentUser && <span className="ml-2 text-[10px] text-white/30">(You)</span>}
                  </p>
                  <p className="text-[10px] text-white/20">{entry.user.studentId}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-xs">
                <div className="text-center">
                  <p className="text-white/20">Profit</p>
                  <p className="font-mono font-bold text-white">{entry.profitPercent.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-white/20">Consistency</p>
                  <p className="font-mono font-bold text-white/60">{entry.consistency.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/20">Score</p>
                  <p className="font-mono text-lg font-bold text-white">{entry.score.toFixed(1)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <Trophy size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No leaderboard data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
