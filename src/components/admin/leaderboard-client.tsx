'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Plus, Save, Trash2 } from 'lucide-react';

interface Entry {
  id: string;
  userId: string;
  score: number;
  profitPercent: number;
  consistency: number;
  completionScore: number;
  weekOf: string;
  user: { name: string | null; email: string; image: string | null; studentId: string | null };
}

export function LeaderboardClient({ initialEntries }: { initialEntries: Entry[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', profitPercent: 0, consistency: 0, completionScore: 0 });

  async function handleCreate(): Promise<void> {
    const score = form.profitPercent * 0.5 + form.consistency * 0.3 + form.completionScore * 0.2;
    const res = await fetch('/api/admin/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, score }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ userId: '', profitPercent: 0, consistency: 0, completionScore: 0 });
      router.refresh();
    }
  }

  async function handleDelete(entry: Entry): Promise<void> {
    if (!confirm(`Remove leaderboard entry for ${entry.user.name ?? entry.user.email}?`)) return;
    await fetch(`/api/admin/leaderboard/${entry.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-white/40">Manage weekly leaderboard entries</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">User ID</label>
              <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" placeholder="User CUID" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Profit %</label>
              <input type="number" value={form.profitPercent} onChange={(e) => setForm({ ...form, profitPercent: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Consistency</label>
              <input type="number" value={form.consistency} onChange={(e) => setForm({ ...form, consistency: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Completion Score</label>
              <input type="number" value={form.completionScore} onChange={(e) => setForm({ ...form, completionScore: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-white/40 hover:text-white/60">Cancel</button>
            <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90">
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Score</th>
              <th>Profit %</th>
              <th>Consistency</th>
              <th>Completion</th>
              <th>Week</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initialEntries.map((entry, i) => (
              <tr key={entry.id}>
                <td>
                  <span className={`text-sm font-bold ${i < 3 ? 'text-white' : 'text-white/40'}`}>#{i + 1}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {entry.user.image ? (
                      <img src={entry.user.image} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/50">
                        {entry.user.name?.[0] ?? 'U'}
                      </div>
                    )}
                    <span className="text-sm text-white">{entry.user.name ?? entry.user.email}</span>
                  </div>
                </td>
                <td className="font-mono text-sm font-bold text-white">{entry.score.toFixed(1)}</td>
                <td className="text-sm text-white/60">{entry.profitPercent.toFixed(1)}%</td>
                <td className="text-sm text-white/60">{entry.consistency.toFixed(1)}</td>
                <td className="text-sm text-white/60">{entry.completionScore.toFixed(1)}</td>
                <td className="text-xs text-white/30">{new Date(entry.weekOf).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(entry)} className="rounded p-1.5 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {initialEntries.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Trophy size={32} className="mx-auto text-white/10" />
                  <p className="mt-2 text-sm text-white/20">No leaderboard entries yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
