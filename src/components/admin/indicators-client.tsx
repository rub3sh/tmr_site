'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Save, Trash2 } from 'lucide-react';

interface IndicatorData {
  id: string;
  name: string;
  slug: string;
  description: string;
  script: string | null;
  strategy: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  planIds: string[];
}

export function IndicatorsClient({ initialIndicators }: { initialIndicators: IndicatorData[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', script: '', strategy: '', imageUrl: '', isPublic: false, planIds: [] as string[],
  });

  async function handleCreate(): Promise<void> {
    const res = await fetch('/api/admin/indicators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: '', description: '', script: '', strategy: '', imageUrl: '', isPublic: false, planIds: [] });
      router.refresh();
    }
  }

  async function handleDelete(id: string, name: string): Promise<void> {
    if (!confirm(`Delete indicator "${name}"?`)) return;
    await fetch(`/api/admin/indicators/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Indicators</h1>
          <p className="mt-1 text-sm text-white/40">Manage trading indicators</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
          <Plus size={16} /> Add Indicator
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" placeholder="Indicator name" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Pine Script</label>
              <textarea value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white outline-none focus:border-white/20" rows={6} placeholder="// Pine Script code..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Strategy</label>
              <textarea value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={3} placeholder="Strategy explanation..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Image URL</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <label className="flex items-center gap-2 self-end pb-3 text-sm text-white/50">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} /> Public (visible to all)
            </label>
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
        {initialIndicators.map((ind) => (
          <div key={ind.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">{ind.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ind.isPublic ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                  {ind.isPublic ? 'Public' : 'Plan Only'}
                </span>
                <button onClick={() => handleDelete(ind.id, ind.name)} className="rounded p-1 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-white/30 line-clamp-2">{ind.description}</p>
            {ind.script && <p className="mt-2 text-[10px] text-white/15">Has Pine Script</p>}
          </div>
        ))}
        {initialIndicators.length === 0 && (
          <div className="col-span-2 flex flex-col items-center py-20">
            <BarChart3 size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No indicators yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
