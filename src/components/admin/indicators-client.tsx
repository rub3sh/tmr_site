'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Save, Trash2, ChevronDown, ChevronUp, Pencil, X, DollarSign } from 'lucide-react';

type Tier = 'CORE' | 'SMT' | 'SUITE';

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
  tier: Tier;
  tradingViewScriptId: string | null;
}

interface TierPricingData {
  id: string;
  tier: Tier;
  label: string;
  description: string;
  monthly: number;
  quarterly: number;
  annual: number;
  features: string[];
  isActive: boolean;
}

const TIERS: Tier[] = ['CORE', 'SMT', 'SUITE'];

const TIER_LABELS: Record<Tier, string> = {
  CORE: 'Core',
  SMT: 'SMT',
  SUITE: 'Suite',
};

function paise(val: number) {
  return `₹${(val / 100).toLocaleString('en-IN')}`;
}

const emptyForm = {
  name: '', description: '', script: '', strategy: '',
  imageUrl: '', isPublic: false, planIds: [] as string[],
  tier: 'SUITE' as Tier, tradingViewScriptId: '',
};

const emptyPricingForm = (tier: Tier): TierPricingData => ({
  id: '', tier, label: '', description: '',
  monthly: 0, quarterly: 0, annual: 0, features: [], isActive: true,
});

export function IndicatorsClient({
  initialIndicators,
  initialTierPricing,
}: {
  initialIndicators: IndicatorData[];
  initialTierPricing: TierPricingData[];
}) {
  const router = useRouter();

  // ── Indicator state ──────────────────────────────────────
  const [indicators, setIndicators] = useState(initialIndicators);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Tier pricing state ───────────────────────────────────
  const [tierPricing, setTierPricing] = useState<TierPricingData[]>(initialTierPricing);
  const [pricingTab, setPricingTab] = useState<Tier>('SUITE');
  const [pricingForm, setPricingForm] = useState<TierPricingData>(
    initialTierPricing.find((t) => t.tier === 'SUITE') ?? emptyPricingForm('SUITE'),
  );
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingMsg, setPricingMsg] = useState('');
  const [featuresText, setFeaturesText] = useState(
    (initialTierPricing.find((t) => t.tier === 'SUITE')?.features ?? []).join('\n'),
  );

  // ── Helpers ──────────────────────────────────────────────
  function switchPricingTab(tier: Tier) {
    setPricingTab(tier);
    const existing = tierPricing.find((t) => t.tier === tier) ?? emptyPricingForm(tier);
    setPricingForm(existing);
    setFeaturesText(existing.features.join('\n'));
    setPricingMsg('');
  }

  function startEdit(ind: IndicatorData) {
    setEditId(ind.id);
    setForm({
      name: ind.name,
      description: ind.description,
      script: ind.script ?? '',
      strategy: ind.strategy ?? '',
      imageUrl: ind.imageUrl ?? '',
      isPublic: ind.isPublic,
      planIds: ind.planIds,
      tier: ind.tier,
      tradingViewScriptId: ind.tradingViewScriptId ?? '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  // ── Indicator CRUD ───────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        tradingViewScriptId: form.tradingViewScriptId.trim() || null,
      };

      if (editId) {
        const res = await fetch(`/api/admin/indicators/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { data } = await res.json();
          setIndicators((prev) => prev.map((i) => (i.id === editId ? data : i)));
        }
      } else {
        const res = await fetch('/api/admin/indicators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { data } = await res.json();
          setIndicators((prev) => [data, ...prev]);
        }
      }
      cancelForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete indicator "${name}"?`)) return;
    await fetch(`/api/admin/indicators/${id}`, { method: 'DELETE' });
    setIndicators((prev) => prev.filter((i) => i.id !== id));
  }

  // ── Pricing save ─────────────────────────────────────────
  async function handlePricingSave() {
    setPricingSaving(true);
    setPricingMsg('');
    try {
      const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean);
      const payload = { ...pricingForm, features };
      const res = await fetch('/api/admin/indicators/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { data } = await res.json();
        setTierPricing((prev) => {
          const exists = prev.find((t) => t.tier === data.tier);
          return exists ? prev.map((t) => (t.tier === data.tier ? data : t)) : [...prev, data];
        });
        setPricingForm(data);
        setPricingMsg('Saved!');
        setTimeout(() => setPricingMsg(''), 2500);
      } else {
        setPricingMsg('Save failed. Please try again.');
      }
    } finally {
      setPricingSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Indicators</h1>
          <p className="mt-1 text-sm text-white/40">Manage indicators and tier pricing</p>
        </div>
        <button
          onClick={() => { cancelForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <Plus size={16} /> Add Indicator
        </button>
      </div>

      {/* ── Indicator form (create / edit) ── */}
      {showForm && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white">{editId ? 'Edit Indicator' : 'New Indicator'}</p>
            <button onClick={cancelForm} className="rounded p-1 text-white/20 hover:text-white/50"><X size={15} /></button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                placeholder="Indicator name" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={3} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Tier</label>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })}
                className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-4 py-3 text-sm text-white outline-none focus:border-white/20">
                {TIERS.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">TradingView Script ID</label>
              <input type="text" value={form.tradingViewScriptId} onChange={(e) => setForm({ ...form, tradingViewScriptId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20 font-mono"
                placeholder="PUB;xxxxxxxxxxxxxxxxxxxxxxxx" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Pine Script (optional inline copy)</label>
              <textarea value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white outline-none focus:border-white/20" rows={5} placeholder="// Pine Script code..." />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Strategy Notes</label>
              <textarea value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={3} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Image URL</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" />
            </div>

            <label className="flex items-center gap-2 self-end pb-3 text-sm text-white/50 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
              Public (visible without a plan)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={cancelForm} className="rounded-lg px-4 py-2 text-sm text-white/40 hover:text-white/60">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">
              <Save size={14} /> {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* ── Indicator list ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {indicators.map((ind) => (
          <div key={ind.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white truncate">{ind.name}</h3>
                  <span className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">
                    {TIER_LABELS[ind.tier]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${ind.isPublic ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/25'}`}>
                    {ind.isPublic ? 'Public' : 'Plan only'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/30 line-clamp-2">{ind.description}</p>
                {ind.tradingViewScriptId && (
                  <p className="mt-1.5 font-mono text-[10px] text-white/20 truncate">{ind.tradingViewScriptId}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(ind)} className="rounded p-1.5 text-white/20 transition hover:bg-white/5 hover:text-white/50" title="Edit">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(ind.id, ind.name)} className="rounded p-1.5 text-white/10 transition hover:bg-red-500/10 hover:text-red-400" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {indicators.length === 0 && (
          <div className="col-span-2 flex flex-col items-center py-20">
            <BarChart3 size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No indicators yet</p>
          </div>
        )}
      </div>

      {/* ── Tier Pricing ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 space-y-6">
        <div className="flex items-center gap-3">
          <DollarSign size={16} className="text-white/40" />
          <div>
            <h2 className="text-base font-semibold text-white">Tier Pricing</h2>
            <p className="text-xs text-white/30">Set the name, features, and prices for each access tier. Prices in INR (₹).</p>
          </div>
        </div>

        {/* Tier tabs */}
        <div className="flex gap-1 rounded-lg border border-white/8 bg-[#0e0e0e] p-1 w-fit">
          {TIERS.map((t) => (
            <button key={t} onClick={() => switchPricingTab(t)}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${pricingTab === t ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}>
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Plan Label (shown to buyers)</label>
            <input type="text" value={pricingForm.label}
              onChange={(e) => setPricingForm({ ...pricingForm, label: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              placeholder={`e.g. Quantum ${TIER_LABELS[pricingTab]} Suite`} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Short Description</label>
            <input type="text" value={pricingForm.description}
              onChange={(e) => setPricingForm({ ...pricingForm, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              placeholder="One-line description" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Monthly Price (₹)</label>
            <input type="number" min={0} value={pricingForm.monthly / 100}
              onChange={(e) => setPricingForm({ ...pricingForm, monthly: Math.round(parseFloat(e.target.value || '0') * 100) })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              placeholder="0" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Quarterly Price (₹)</label>
            <input type="number" min={0} value={pricingForm.quarterly / 100}
              onChange={(e) => setPricingForm({ ...pricingForm, quarterly: Math.round(parseFloat(e.target.value || '0') * 100) })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              placeholder="0" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Annual Price (₹)</label>
            <input type="number" min={0} value={pricingForm.annual / 100}
              onChange={(e) => setPricingForm({ ...pricingForm, annual: Math.round(parseFloat(e.target.value || '0') * 100) })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              placeholder="0" />
          </div>

          <label className="flex items-center gap-2 self-end pb-3 text-sm text-white/50 cursor-pointer">
            <input type="checkbox" checked={pricingForm.isActive}
              onChange={(e) => setPricingForm({ ...pricingForm, isActive: e.target.checked })} />
            Active (visible on purchase page)
          </label>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Features <span className="normal-case font-normal text-white/20">(one per line)</span>
            </label>
            <textarea value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/20" rows={5}
              placeholder={"All 9 indicators\nQuantum Algo Clock\nQuantum SMT Engine"} />
          </div>
        </div>

        {/* Preview + save */}
        {(pricingForm.monthly > 0 || pricingForm.quarterly > 0 || pricingForm.annual > 0) && (
          <div className="rounded-lg border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/40 space-y-0.5">
            <span className="text-white/20 uppercase tracking-wider text-[10px]">Preview: </span>
            {pricingForm.monthly > 0 && <span className="ml-2">{paise(pricingForm.monthly)}/mo</span>}
            {pricingForm.quarterly > 0 && <span className="ml-2">{paise(pricingForm.quarterly)}/qtr</span>}
            {pricingForm.annual > 0 && <span className="ml-2">{paise(pricingForm.annual)}/yr</span>}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {pricingMsg && (
            <span className={`text-xs ${pricingMsg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>{pricingMsg}</span>
          )}
          <button onClick={handlePricingSave} disabled={pricingSaving || !pricingForm.label.trim()}
            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">
            <Save size={14} /> {pricingSaving ? 'Saving…' : 'Save Pricing'}
          </button>
        </div>
      </div>

    </div>
  );
}
