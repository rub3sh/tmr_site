'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ChevronDown, Loader2, CreditCard } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
}

interface StudentActionsProps {
  studentId: string;
  currentStatus: string;
  currentPlanId: string | null;
  plans: Plan[];
  currentPlanName?: string | null;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-white/5 text-white/30 border-white/8',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pro: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  elite: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function planColor(name: string | null | undefined) {
  if (!name) return PLAN_COLORS.free;
  const key = name.toLowerCase();
  return PLAN_COLORS[key] ?? 'bg-white/5 text-white/40 border-white/10';
}

export function StudentActions({ studentId, currentStatus, currentPlanId, plans, currentPlanName }: StudentActionsProps) {
  const router = useRouter();
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [planUpdating, setPlanUpdating] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function updateStatus(status: string) {
    setLoadingStatus(status);
    try {
      await fetch(`/api/admin/students/${studentId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      });
      router.refresh();
    } finally {
      setLoadingStatus(null);
    }
  }

  async function changePlan(planId: string | null) {
    setPlanUpdating(true);
    try {
      await fetch(`/api/admin/students/${studentId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: 'MONTHLY' }),
      });
      setShowPlanMenu(false);
      router.refresh();
    } finally {
      setPlanUpdating(false);
    }
  }

  const allOptions = [
    { id: null, name: 'Free' },
    ...plans,
  ];

  return (
    <div className="flex items-center gap-1.5">
      {/* Verification status buttons */}
      <div className="flex items-center gap-0.5">
        {currentStatus !== 'VERIFIED' && (
          <button
            onClick={() => updateStatus('VERIFIED')}
            disabled={!!loadingStatus}
            title="Verify student"
            className="rounded p-1.5 text-green-400/40 transition hover:bg-green-500/10 hover:text-green-400 disabled:opacity-40"
          >
            {loadingStatus === 'VERIFIED' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
          </button>
        )}
        {currentStatus !== 'REJECTED' && (
          <button
            onClick={() => updateStatus('REJECTED')}
            disabled={!!loadingStatus}
            title="Reject student"
            className="rounded p-1.5 text-red-400/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
          >
            {loadingStatus === 'REJECTED' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
          </button>
        )}
        {currentStatus !== 'PENDING' && (
          <button
            onClick={() => updateStatus('PENDING')}
            disabled={!!loadingStatus}
            title="Set to pending"
            className="rounded p-1.5 text-yellow-400/40 transition hover:bg-yellow-500/10 hover:text-yellow-400 disabled:opacity-40"
          >
            {loadingStatus === 'PENDING' ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
          </button>
        )}
      </div>

      {/* Plan change — visible badge + dropdown */}
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setShowPlanMenu((p) => !p)}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80 ${planColor(currentPlanName)}`}
        >
          <CreditCard size={11} />
          {currentPlanName ?? 'Free'}
          {planUpdating
            ? <Loader2 size={10} className="animate-spin" />
            : <ChevronDown size={10} className={`transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} />
          }
        </button>

        {showPlanMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPlanMenu(false)} />
            <div
              className="fixed z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-2xl shadow-black/60"
              ref={(el) => {
                if (el && btnRef.current) {
                  const rect = btnRef.current.getBoundingClientRect();
                  el.style.top = `${rect.bottom + 6}px`;
                  el.style.left = `${Math.min(rect.left, window.innerWidth - 180)}px`;
                }
              }}
            >
              <p className="border-b border-white/5 px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-white/25">
                Assign Plan
              </p>
              {allOptions.map((opt) => {
                const isCurrent = opt.id === null ? !currentPlanId : currentPlanId === opt.id;
                return (
                  <button
                    key={opt.id ?? 'free'}
                    onClick={() => changePlan(opt.id)}
                    disabled={planUpdating || isCurrent}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition hover:bg-white/[0.04] disabled:cursor-default ${
                      isCurrent ? 'font-semibold text-white' : 'text-white/45 hover:text-white/70'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[9px] text-white/30">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
