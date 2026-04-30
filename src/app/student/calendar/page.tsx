'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalEvent {
  id: string;
  title: string;
  shortTitle?: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string | null;
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  country?: string;
  currency?: string;
  url?: string;
}

const IMPACT = {
  HIGH: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400', label: 'High Impact' },
  MEDIUM: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Medium Impact' },
  LOW: { dot: 'bg-sky-400', bg: 'bg-sky-500/10', text: 'text-sky-400', label: 'Low Impact' },
};

const EVENT_COLORS: Record<string, string> = {
  LIVE_SESSION: 'bg-red-400',
  TRADE_BREAKDOWN: 'bg-blue-400',
  PERSONAL: 'bg-purple-400',
};

export default function StudentCalendarPage() {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [allEvents, setAllEvents] = useState<CalEvent[]>([]);
  const [source, setSource] = useState('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const [selectedDate, setSelectedDate] = useState(todayUTC);

  useEffect(() => {
    const q = new URLSearchParams({
      year: String(currentMonth.getUTCFullYear()),
      month: String(currentMonth.getUTCMonth() + 1),
    });
    const ctrl = new AbortController();

    fetch(`/api/calendar?${q}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setAllEvents(d.data);
          setSource(d.meta?.source ?? '');
        }
      })
      .catch(() => {});

    return () => ctrl.abort();
  }, [currentMonth]);

  // Red-folder: HIGH impact economic news + all non-economic events
  const redFolderEvents = allEvents.filter(
    (e) => e.eventType !== 'ECONOMIC_NEWS' || e.impactLevel === 'HIGH'
  );

  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0)).getUTCDate();
  const startDay = monthStart.getUTCDay();

  function eventsForDay(day: number): CalEvent[] {
    return redFolderEvents.filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === day
        && d.getUTCMonth() === currentMonth.getUTCMonth()
        && d.getUTCFullYear() === currentMonth.getUTCFullYear();
    });
  }

  const selectedEvents = redFolderEvents
    .filter((e) => {
      const d = new Date(e.startTime);
      return d.getUTCDate() === selectedDate.getUTCDate()
        && d.getUTCMonth() === selectedDate.getUTCMonth()
        && d.getUTCFullYear() === selectedDate.getUTCFullYear();
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Calendar</h1>
        <p className="mt-1 text-sm text-white/40">Sessions, events &amp; high-impact market news</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))}
                className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white/60"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
                  setCurrentMonth(m);
                  setSelectedDate(todayUTC);
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs text-white/30 hover:bg-white/5 hover:text-white/60"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))}
                className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white/60"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-medium uppercase text-white/20">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayUtc = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day));
              const dayEvts = eventsForDay(day);
              const isToday = dayUtc.getTime() === todayUTC.getTime();
              const isSelected = dayUtc.getTime() === selectedDate.getTime();

              // Priority: high-impact economic > other economic > sessions
              const highImpact = dayEvts.filter((e) => e.eventType === 'ECONOMIC_NEWS' && e.impactLevel === 'HIGH');

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dayUtc)}
                  className={`aspect-square rounded-lg p-1.5 text-left transition ${
                    isSelected
                      ? 'bg-red-500/15 ring-1 ring-red-400/40'
                      : isToday
                      ? 'bg-white/5 ring-1 ring-white/10'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={`block text-xs leading-none ${isSelected || isToday ? 'font-bold text-white' : 'text-white/40'}`}>
                    {day}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-[2px]">
                      {dayEvts.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            e.eventType === 'ECONOMIC_NEWS'
                              ? e.impactLevel === 'HIGH' ? 'bg-red-400' : e.impactLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-sky-400'
                              : EVENT_COLORS[e.eventType] ?? 'bg-white/30'
                          }`}
                        />
                      ))}
                      {highImpact.length > 0 && (
                        <span className="text-[8px] font-bold text-red-400/70 leading-none mt-[1px] ml-0.5">
                          {highImpact[0].shortTitle?.substring(0, 4)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-white/25">High Impact</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400/40" />
              <span className="text-[10px] text-white/25">Live Session</span>
            </div>
            {source === 'finnhub' && (
              <span className="text-[10px] text-white/20">Full month · Finnhub</span>
            )}
            {source === 'forex_factory' && (
              <span className="text-[10px] text-white/20">This &amp; next week · Forex Factory</span>
            )}
          </div>
        </div>

        {/* Day events */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/50">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
          </h3>

          {selectedEvents.map((event) => {
            const impact = event.impactLevel && IMPACT[event.impactLevel] ? IMPACT[event.impactLevel] : null;
            return (
              <div key={event.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {event.eventType !== 'ECONOMIC_NEWS' && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                  )}
                  {impact && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${impact.bg} ${impact.text}`}>
                      {impact.label}
                    </span>
                  )}
                  {event.currency && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono font-bold text-white/50">
                      {event.currency}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 text-sm font-medium text-white">{event.title}</h4>
                <p className="mt-1 text-[11px] text-white/30">
                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  {' UTC'}
                </p>
                {event.description && (
                  <p className="mt-2 text-[11px] text-white/35">{event.description}</p>
                )}
              </div>
            );
          })}

          {selectedEvents.length === 0 && (
            <div className="flex flex-col items-center py-10">
              <CalendarIcon size={32} className="text-white/10" />
              <p className="mt-2 text-xs text-white/20">No high-impact events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
