'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Ticket, Save, Trash2 } from 'lucide-react';

interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

export function CouponsClient({ initialCoupons }: { initialCoupons: CouponData[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountPercent: 10, maxUses: 0, expiresAt: '' });

  async function handleCreate(): Promise<void> {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ code: '', discountPercent: 10, maxUses: 0, expiresAt: '' });
      router.refresh();
    }
  }

  async function toggleActive(coupon: CouponData): Promise<void> {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    router.refresh();
  }

  async function handleDelete(coupon: CouponData): Promise<void> {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Coupons</h1>
          <p className="mt-1 text-sm text-white/40">Manage discount coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-white outline-none focus:border-white/20" placeholder="WELCOME20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Discount %</label>
              <input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Max Uses (0 = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
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

      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Used</th><th>Max</th><th>Expires</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {initialCoupons.map((c) => (
              <tr key={c.id}>
                <td className="font-mono text-sm font-bold text-white">{c.code}</td>
                <td>{c.discountPercent}%</td>
                <td>{c.usedCount}</td>
                <td>{c.maxUses ?? '\u221E'}</td>
                <td className="text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td>
                  <button onClick={() => toggleActive(c)} className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(c)} className="rounded p-1.5 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {initialCoupons.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center"><Ticket size={32} className="mx-auto text-white/10" /><p className="mt-2 text-sm text-white/20">No coupons yet</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
