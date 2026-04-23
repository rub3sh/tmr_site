'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CreditCard, Trash2, Save } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  discordRoleId: string | null;
  _count: { subscriptions: number };
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
}

export function PlansClient({ initialPlans }: { initialPlans: Plan[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', priceMonthly: 0, priceYearly: 0, features: [''], discordRoleId: '',
  });

  async function handleCreate(): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, features: form.features.filter(Boolean) }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: '', description: '', priceMonthly: 0, priceYearly: 0, features: [''], discordRoleId: '' });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan): Promise<void> {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    router.refresh();
  }

  async function handleDelete(plan: Plan): Promise<void> {
    if (!confirm(`Delete "${plan.name}" plan? This will also remove all subscriptions for this plan.`)) return;
    await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Plans</h1>
          <p className="mt-1 text-sm text-white/40">Manage subscription plans</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">Create New Plan</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Plan Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" placeholder="e.g. Pro" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Monthly Price (Paise)</label>
              <input type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Yearly Price (Paise)</label>
              <input type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" rows={2} placeholder="Plan description..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Features (one per line)</label>
              {form.features.map((f, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <input type="text" value={f} onChange={(e) => {
                    const updated = [...form.features];
                    updated[i] = e.target.value;
                    setForm({ ...form, features: updated });
                  }} className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 outline-none" placeholder="Feature..." />
                  {form.features.length > 1 && (
                    <button onClick={() => setForm({ ...form, features: form.features.filter((_, fi) => fi !== i) })} className="p-1 text-white/20 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setForm({ ...form, features: [...form.features, ''] })} className="text-xs text-white/30 hover:text-white/50">
                + Add Feature
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Discord Role ID</label>
              <input type="text" value={form.discordRoleId} onChange={(e) => setForm({ ...form, discordRoleId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none" placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-white/40 hover:text-white/60">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              <Save size={14} /> {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {initialPlans.map((plan) => (
          <div key={plan.id} className={`rounded-xl border p-6 transition ${plan.isActive ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleActive(plan)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${plan.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(plan)} className="rounded p-1 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete plan">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {plan.description && <p className="mt-1 text-xs text-white/30">{plan.description}</p>}
            <div className="mt-4 space-y-1">
              <p className="text-2xl font-bold text-white">{formatINR(plan.priceMonthly)}<span className="text-sm font-normal text-white/30">/mo</span></p>
              <p className="text-xs text-white/30">{formatINR(plan.priceYearly)}/yr</p>
            </div>
            <div className="mt-4 space-y-1">
              {plan.features.map((f, i) => (
                <p key={i} className="text-xs text-white/40">&bull; {f}</p>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-white/20">{plan._count.subscriptions} subscribers</p>
          </div>
        ))}
        {initialPlans.length === 0 && (
          <div className="col-span-3 flex flex-col items-center py-20">
            <CreditCard size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No plans yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
