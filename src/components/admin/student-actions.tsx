'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ChevronDown, Crown, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
}

interface StudentActionsProps {
  studentId: string;
  currentStatus: string;
  currentPlanId: string | null;
  plans: Plan[];
}

export function StudentActions({ studentId, currentStatus, currentPlanId, plans }: StudentActionsProps) {
  const router = useRouter();
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: string): Promise<void> {
    await fetch(`/api/admin/students/${studentId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: status }),
    });
    router.refresh();
  }

  async function changePlan(planId: string | null): Promise<void> {
    setUpdating(true);
    await fetch(`/api/admin/students/${studentId}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle: 'MONTHLY' }),
    });
    setUpdating(false);
    setShowPlanMenu(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      {/* Verification buttons */}
      {currentStatus !== 'VERIFIED' && (
        <button onClick={() => updateStatus('VERIFIED')}
          className="rounded p-1.5 text-green-400/50 transition hover:bg-green-500/10 hover:text-green-400" title="Verify">
          <CheckCircle size={14} />
        </button>
      )}
      {currentStatus !== 'REJECTED' && (
        <button onClick={() => updateStatus('REJECTED')}
          className="rounded p-1.5 text-red-400/50 transition hover:bg-red-500/10 hover:text-red-400" title="Reject">
          <XCircle size={14} />
        </button>
      )}
      {currentStatus !== 'PENDING' && (
        <button onClick={() => updateStatus('PENDING')}
          className="rounded p-1.5 text-yellow-400/50 transition hover:bg-yellow-500/10 hover:text-yellow-400" title="Set Pending">
          <Clock size={14} />
        </button>
      )}

      {/* Plan promotion dropdown */}
      <div className="relative ml-1">
        <button
          onClick={() => setShowPlanMenu(!showPlanMenu)}
          className="flex items-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium text-white/30 transition hover:bg-white/5 hover:text-white/50"
          title="Change plan"
        >
          <Crown size={12} />
          <ChevronDown size={10} className={`transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} />
        </button>

        {showPlanMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPlanMenu(false)} />
            <div className="fixed z-50 w-48 rounded-xl border border-white/10 bg-[#0c0c0c] py-1.5 shadow-2xl"
              style={{ top: 'auto', left: 'auto' }}
              ref={(el) => {
                if (el) {
                  const btn = el.parentElement?.querySelector('button');
                  if (btn) {
                    const rect = btn.getBoundingClientRect();
                    el.style.top = `${rect.bottom + 6}px`;
                    el.style.left = `${Math.min(rect.left, window.innerWidth - 200)}px`;
                  }
                }
              }}
            >
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/25">Assign Plan</p>

              <button
                onClick={() => changePlan(null)}
                disabled={updating}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-white/5 ${
                  !currentPlanId ? 'text-white font-medium' : 'text-white/50'
                }`}
              >
                {updating ? <Loader2 size={10} className="animate-spin" /> : null}
                Free (No Plan)
                {!currentPlanId && <span className="ml-auto text-[10px] text-white/20">Current</span>}
              </button>

              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => changePlan(plan.id)}
                  disabled={updating}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-white/5 ${
                    currentPlanId === plan.id ? 'text-white font-medium' : 'text-white/50'
                  }`}
                >
                  {updating ? <Loader2 size={10} className="animate-spin" /> : null}
                  {plan.name}
                  {currentPlanId === plan.id && <span className="ml-auto text-[10px] text-white/20">Current</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
