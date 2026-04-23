'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string | null;
  isPublic: boolean;
}

const EVENT_TYPES = ['LIVE_SESSION', 'ECONOMIC_NEWS', 'TRADE_BREAKDOWN', 'PERSONAL'];
const EVENT_COLORS: Record<string, string> = {
  LIVE_SESSION: 'bg-red-500/10 text-red-400',
  ECONOMIC_NEWS: 'bg-yellow-500/10 text-yellow-400',
  TRADE_BREAKDOWN: 'bg-blue-500/10 text-blue-400',
  PERSONAL: 'bg-purple-500/10 text-purple-400',
};

export function CalendarClient({ initialEvents }: { initialEvents: CalEvent[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', eventType: 'LIVE_SESSION', startTime: '', endTime: '', isPublic: true,
  });

  async function handleCreate(): Promise<void> {
    const res = await fetch('/api/admin/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await fetch(`/api/admin/calendar/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-white/40">Manage events and sessions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" placeholder="Event title" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Type</label>
              <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none">
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Start Time</label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">End Time</label>
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none" rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/50">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} /> Public event
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-white/40">Cancel</button>
            <button onClick={handleCreate} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">Create</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {initialEvents.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${EVENT_COLORS[event.eventType] ?? 'bg-white/5 text-white/40'}`}>
                {event.eventType.replace(/_/g, ' ')}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{event.title}</p>
                <p className="text-[11px] text-white/25">
                  {new Date(event.startTime).toLocaleString()}
                  {event.endTime && ` \u2014 ${new Date(event.endTime).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(event.id)} className="p-2 text-white/15 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {initialEvents.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <CalendarIcon size={48} className="text-white/10" />
            <p className="mt-4 text-sm text-white/30">No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
