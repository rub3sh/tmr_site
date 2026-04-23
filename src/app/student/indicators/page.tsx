'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, Lock, Copy, Check, Eye } from 'lucide-react';

interface IndicatorData {
  id: string;
  name: string;
  description: string;
  script: string | null;
  strategy: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  planIds: string[];
  hasAccess?: boolean;
}

export default function StudentIndicatorsPage() {
  const { data: session } = useSession();
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/indicators')
      .then((r) => r.json())
      .then((d) => { if (d.data) setIndicators(d.data); })
      .catch(() => {});
  }, []);

  function copyScript(id: string, script: string): void {
    navigator.clipboard.writeText(script);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const selected = indicators.find((i) => i.id === selectedId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Indicators</h1>
        <p className="mt-1 text-sm text-white/40">Premium trading indicators and strategies</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Indicator Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {indicators.map((ind) => {
            const hasAccess = ind.isPublic || ind.hasAccess;

            return (
              <button
                key={ind.id}
                onClick={() => hasAccess ? setSelectedId(ind.id) : undefined}
                className={`group relative rounded-2xl border p-5 text-left transition-all ${
                  selectedId === ind.id
                    ? 'border-white/15 bg-white/[0.05]'
                    : hasAccess
                    ? 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    : 'border-white/[0.03] bg-white/[0.01] opacity-50'
                }`}
              >
                {!hasAccess && (
                  <div className="absolute right-3 top-3">
                    <Lock size={14} className="text-white/20" />
                  </div>
                )}

                {ind.imageUrl && (
                  <div className="mb-3 aspect-video w-full overflow-hidden rounded-lg bg-white/5">
                    <img src={ind.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}

                <h3 className="font-medium text-white">{ind.name}</h3>
                <p className="mt-1 text-xs text-white/30 line-clamp-2">{ind.description}</p>

                <div className="mt-3 flex items-center gap-2">
                  {ind.script && hasAccess && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                      Pine Script
                    </span>
                  )}
                  {ind.strategy && hasAccess && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                      Strategy
                    </span>
                  )}
                  {!hasAccess && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/20">
                      Upgrade Plan
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {indicators.length === 0 && (
            <div className="col-span-2 flex flex-col items-center py-20">
              <BarChart3 size={48} className="text-white/10" />
              <p className="mt-4 text-sm text-white/30">No indicators available</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">{selected.name}</h2>
            <p className="text-sm text-white/40">{selected.description}</p>

            {selected.strategy && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">Strategy</p>
                <p className="text-sm text-white/50 leading-relaxed">{selected.strategy}</p>
              </div>
            )}

            {selected.script && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/30">Pine Script</p>
                  <button
                    onClick={() => copyScript(selected.id, selected.script!)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/30 transition hover:bg-white/5 hover:text-white/50"
                  >
                    {copiedId === selected.id ? (
                      <><Check size={12} className="text-green-400" /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-xl border border-white/5 bg-black p-4 font-mono text-xs text-white/50">
                  {selected.script}
                </pre>
              </div>
            )}

            {selected.imageUrl && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/30">Preview</p>
                <img src={selected.imageUrl} alt="" className="w-full rounded-xl" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-20">
            <Eye size={32} className="text-white/10" />
            <p className="mt-3 text-sm text-white/20">Select an indicator to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
