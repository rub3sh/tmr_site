'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Gift, Save, Trash2 } from 'lucide-react';

interface GiveawayData {
  id: string;
  title: string;
  description: string;
  prize: string;
  rules: string[];
  status: string;
  startsAt: string;
  endsAt: string;
  _count?: { entries: number };
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: 'bg-blue-500/10 text-blue-400',
  ACTIVE: 'bg-green-500/10 text-green-400',
  ENDED: 'bg-white/5 text-white/30',
};

export function GiveawaysClient({ initialGiveaways }: { initialGiveaways: GiveawayData[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', prize: '', rules: [''], startsAt: '', endsAt: '', maxEntries: 0,
  });

  async function handleCreate(): Promise<void> {
    const res = await fetch('/api/admin/giveaways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rules: form.rules.filter(Boolean) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: '', description: '', prize: '', rules: [''], startsAt: '', endsAt: '', maxEntries: 0 });
      router.refresh();
    }
  }

  async function handleDelete(id: string, title: string): Promise<void> {
    if (!confirm(`Delete giveaway "${title}"? All entries will be removed.`)) return;
    await fetch(`/api/admin/giveaways/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Giveaways</h1>
          <p className="mt-1 text-sm text-white/40">Manage giveaways and promotions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
          <Plus size={16} /> New Giveaway
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={2} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Prize</label>
              <input type="text" value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" placeholder="e.g. 1 month Pro plan" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Max Entries (0 = unlimited)</label>
              <input type="number" value={form.maxEntries} onChange={(e) => setForm({ ...form, maxEntries: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Starts At</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Ends At</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Rules</label>
              {form.rules.map((r, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <input type="text" value={r} onChange={(e) => {
                    const updated = [...form.rules]; updated[i] = e.target.value; setForm({ ...form, rules: updated });
                  }} className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white outline-none focus:border-white/20" placeholder="Rule..." />
                  {form.rules.length > 1 && (
                    <button onClick={() => setForm({ ...form, rules: form.rules.filter((_, fi) => fi !== i) })} className="p-1 text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setForm({ ...form, rules: [...form.rules, ''] })} className="text-xs text-white/30 hover:text-white/50">+ Add Rule</button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-white/40 hover:text-white/60">Cancel</button>
            <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90">
              <Save size={14} /> Create
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {initialGiveaways.map((g) => (
          <div key={g.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">{g.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[g.status] ?? 'bg-white/5 text-white/30'}`}>
                  {g.status}
                </span>
                <button onClick={() => handleDelete(g.id, g.title)} className="rounded p-1 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-white/30">{g.prize}</p>
            <p className="mt-2 text-[11px] text-white/20">
              {new Date(g.startsAt).toLocaleDateString()} — {new Date(g.endsAt).toLocaleDateString()}
            </p>
            <p className="mt-1 text-[10px] text-white/15">{g._count?.entries ?? 0} entries</p>
          </div>
        ))}
        {initialGiveaways.length === 0 && (
          <div className="col-span-2 flex flex-col items-center py-20">
            <Gift size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No giveaways yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
