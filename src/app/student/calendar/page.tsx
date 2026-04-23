'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string | null;
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  source?: string;
  country?: string;
  url?: string;
}

const EVENT_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  LIVE_SESSION: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  ECONOMIC_NEWS: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  TRADE_BREAKDOWN: { dot: 'bg-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  PERSONAL: { dot: 'bg-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

const IMPACT_STYLES: Record<'HIGH' | 'MEDIUM' | 'LOW', { dot: string; bg: string; text: string; label: string }> = {
  HIGH: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400', label: 'High Impact' },
  MEDIUM: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Medium Impact' },
  LOW: { dot: 'bg-sky-400', bg: 'bg-sky-500/10', text: 'text-sky-400', label: 'Low Impact' },
};

function getEventStyle(event: CalEvent): { dot: string; bg: string; text: string } {
  if (event.eventType === 'ECONOMIC_NEWS' && event.impactLevel) {
    return IMPACT_STYLES[event.impactLevel] ?? EVENT_STYLES[event.eventType];
  }

  return EVENT_STYLES[event.eventType] ?? { dot: 'bg-white/20', bg: 'bg-white/5', text: 'text-white/40' };
}

export default function StudentCalendarPage() {
  const now = new Date();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [forexCoverage, setForexCoverage] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );

  useEffect(() => {
    setSelectedDate(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1)));
  }, [currentMonth]);

  useEffect(() => {
    const query = new URLSearchParams({
      year: String(currentMonth.getUTCFullYear()),
      month: String(currentMonth.getUTCMonth() + 1),
    });
    const controller = new AbortController();

    fetch(`/api/calendar?${query.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setEvents(d.data);
          setForexCoverage(d.meta?.forexCoverage ?? '');
        }
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          // Intentionally no-op to keep dashboard resilient to transient API failures.
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentMonth]);

  const monthStart = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0));
  const startDay = monthStart.getUTCDay();

  const daysInMonth = monthEnd.getUTCDate();
  const today = new Date();

  const redFolderNews = events.filter((event) => event.eventType === 'ECONOMIC_NEWS' && event.impactLevel === 'HIGH');

  function getEventsForDay(day: number): CalEvent[] {
    return redFolderNews.filter((event) => {
      const date = new Date(event.startTime);
      return date.getUTCDate() === day
        && date.getUTCMonth() === currentMonth.getUTCMonth()
        && date.getUTCFullYear() === currentMonth.getUTCFullYear();
    });
  }

  const selectedDateEvents = redFolderNews
    .filter((event) => {
      const date = new Date(event.startTime);
      return date.getUTCDate() === selectedDate.getUTCDate()
        && date.getUTCMonth() === selectedDate.getUTCMonth()
        && date.getUTCFullYear() === selectedDate.getUTCFullYear();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Calendar</h1>
        <p className="mt-1 text-sm text-white/40">Sessions, events, and market news</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar Grid */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))}
                className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white/60">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))}
                className="rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white/60">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-white/20">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getUTCDate() === day
                && today.getUTCMonth() === currentMonth.getUTCMonth()
                && today.getUTCFullYear() === currentMonth.getUTCFullYear();
              const isSelected = selectedDate.getUTCDate() === day
                && selectedDate.getUTCMonth() === currentMonth.getUTCMonth()
                && selectedDate.getUTCFullYear() === currentMonth.getUTCFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day)))}
                  className={`aspect-square rounded-lg p-1.5 text-left transition ${isSelected ? 'bg-red-500/15 ring-1 ring-red-400/40' : isToday ? 'bg-white/5 ring-1 ring-white/10' : 'hover:bg-white/[0.02]'}`}
                >
                  <span className={`text-xs ${isSelected || isToday ? 'font-bold text-white' : 'text-white/40'}`}>{day}</span>
                  <div className="mt-0.5 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="h-1 w-1 rounded-full bg-red-400" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-white/25">Red Folder News (High Impact)</span>
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/50">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </h3>
          {forexCoverage === 'THIS_WEEK_ONLY' && (
            <p className="text-[11px] text-white/35">
              Source coverage: Forex Factory public export currently provides this-week feed.
            </p>
          )}
          {selectedDateEvents.map((event) => {
            const style = getEventStyle(event);
            return (
              <div key={event.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
                    {event.eventType.replace(/_/g, ' ')}
                  </span>
                  {event.eventType === 'ECONOMIC_NEWS' && event.impactLevel && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${IMPACT_STYLES[event.impactLevel].bg} ${IMPACT_STYLES[event.impactLevel].text}`}>
                      {IMPACT_STYLES[event.impactLevel].label}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 text-sm font-medium text-white">{event.title}</h4>
                <p className="mt-1 text-[11px] text-white/25">
                  {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  {' at '}
                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                </p>
                {event.description && (
                  <p className="mt-2 text-[11px] text-white/35">{event.description}</p>
                )}
              </div>
            );
          })}
          {selectedDateEvents.length === 0 && (
            <div className="flex flex-col items-center py-8">
              <CalendarIcon size={32} className="text-white/10" />
              <p className="mt-2 text-xs text-white/20">No red-folder news for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
