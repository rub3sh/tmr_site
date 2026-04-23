'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

type Plan = { id: string; name: string };

export default function CreateCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [priceInPaise, setPriceInPaise] = useState(0);
  const [taxMode, setTaxMode] = useState<'INCLUSIVE' | 'EXCLUSIVE'>('INCLUSIVE');
  const [taxPercent, setTaxPercent] = useState(18);
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/plans')
      .then((r) => r.json())
      .then((data) => { if (data.data) setPlans(data.data); })
      .catch(() => {});
  }, []);

  function generateSlug(t: string): string {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function togglePlan(planId: string): void {
    setSelectedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  }

  const finalPrice = taxMode === 'EXCLUSIVE'
    ? Math.round(priceInPaise * (1 + taxPercent / 100))
    : priceInPaise;

  async function handleCreate(): Promise<void> {
    if (!title.trim()) { setError('Course name is required'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug: slug || generateSlug(title), description, shortDesc,
          thumbnailUrl, priceInPaise, taxMode, taxPercent, difficulty,
          category: category || null, status, lessons: [], planIds: selectedPlanIds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        router.push(`/admin/courses/${data.data.id}/edit`);
      } else {
        setError(data.error || 'Failed to create course');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/courses')} className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/60">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Create Course</h1>
          <p className="text-sm text-white/40">Set up your course, then add modules and videos</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Course Details */}
      <div className="space-y-6 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Course Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Course Name *</label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(generateSlug(e.target.value)); }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20" placeholder="e.g. Orderflow Mastery" />
            {slug && <p className="mt-1 text-xs text-white/20">Slug: {slug}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Short Description</label>
            <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20" placeholder="Brief one-liner..." />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20" placeholder="Detailed course description..." />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Thumbnail URL</label>
            <input type="text" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-6 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Price (Paise)</label>
            <input type="number" value={priceInPaise} onChange={(e) => setPriceInPaise(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20" placeholder="499900 = ₹4,999" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Tax Mode</label>
            <div className="flex gap-2">
              {(['INCLUSIVE', 'EXCLUSIVE'] as const).map((mode) => (
                <button key={mode} onClick={() => setTaxMode(mode)} className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  taxMode === mode ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 bg-white/[0.02] text-white/30 hover:border-white/10'
                }`}>{mode}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Tax %</label>
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Final Price</label>
            <div className="flex items-center rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 text-sm text-white/50">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(finalPrice / 100)}
            </div>
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-6 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Classification</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 hover:border-white/20 [&>option]:bg-[#0b0b0b] [&>option]:text-white">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-white/20" placeholder="e.g. Orderflow" />
          </div>
        </div>
      </div>

      {/* Plan Access */}
      <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Plan Access</h2>
          <p className="mt-1 text-xs text-white/30">Select which plans can access this course</p>
        </div>
        {plans.length === 0 ? (
          <p className="text-xs text-white/20">No plans created yet. Create plans first.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-3">
            {plans.map((plan) => {
              const selected = selectedPlanIds.includes(plan.id);
              return (
                <button key={plan.id} onClick={() => togglePlan(plan.id)} className={`rounded-lg border p-3 text-left text-sm font-medium transition ${
                  selected ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 bg-white/[0.01] text-white/30 hover:border-white/10'
                }`}>
                  {plan.name}
                  {selected && <span className="ml-2 text-xs text-white/50">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Publish Status */}
      <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Status</h2>
        <div className="flex gap-2">
          {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
              status === s ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 text-white/30 hover:border-white/10'
            }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button onClick={() => router.push('/admin/courses')} className="rounded-lg px-5 py-2.5 text-sm font-medium text-white/30 transition hover:bg-white/5 hover:text-white/50">
          Cancel
        </button>
        <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Creating...' : 'Create & Add Modules'}
        </button>
      </div>
    </div>
  );
}
