'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Clock, DiscIcon } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getAccessExpiry, formatPaise, type TierPricingRecord, type AccessPeriod } from '@/lib/indicator-pricing';

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const PERIODS: Array<{ id: AccessPeriod; label: string }> = [
  { id: 'MONTHLY', label: 'Monthly' },
  { id: 'QUARTERLY', label: 'Quarterly' },
  { id: 'ANNUAL', label: 'Annual' },
];

async function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type SuccessData = {
  tradingViewUsername: string;
  accessExpiresAt: string;
  tvAccessGranted: boolean;
  tier: string;
};

function getPeriodPrice(tier: TierPricingRecord, period: AccessPeriod): number {
  if (period === 'MONTHLY') return tier.monthly;
  if (period === 'QUARTERLY') return tier.quarterly;
  return tier.annual;
}

export default function IndicatorPurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tiers, setTiers] = useState<TierPricingRecord[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState('');

  const [selectedTier, setSelectedTier] = useState<TierPricingRecord | null>(null);
  const [period, setPeriod] = useState<AccessPeriod>('MONTHLY');
  const [tvUsername, setTvUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessData | null>(null);

  useEffect(() => {
    fetch('/api/indicators/pricing')
      .then((r) => r.json())
      .then((d) => {
        const list: TierPricingRecord[] = d.data ?? [];
        setTiers(list);
        if (list.length > 0) setSelectedTier(list[list.length - 1]); // default to last (typically Suite)
      })
      .catch(() => setPricingError('Failed to load pricing. Please refresh the page.'))
      .finally(() => setPricingLoading(false));
  }, []);

  const currentPrice = selectedTier ? getPeriodPrice(selectedTier, period) : 0;

  async function handlePurchase() {
    if (!selectedTier) { setError('Please select a plan.'); return; }
    if (!tvUsername.trim()) { setError('Please enter your TradingView username.'); return; }
    setError('');
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError('Failed to load payment gateway. Please try again.'); setLoading(false); return; }

      const orderRes = await fetch('/api/indicators/purchase/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier.tier, accessPeriod: period, tradingViewUsername: tvUsername.trim() }),
      });

      if (!orderRes.ok) {
        const d = await orderRes.json().catch(() => null);
        setError(d?.error ?? 'Failed to create order. Please try again.');
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId, planLabel } = await orderRes.json();

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'TheMarketRevelation',
        description: planLabel ?? selectedTier.label,
        order_id: orderId,
        prefill: {
          name: session?.user?.name ?? '',
          email: session?.user?.email ?? '',
        },
        theme: { color: '#ffffff' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/indicators/purchase/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            const data = await verifyRes.json();
            setSuccess({ ...data, tier: selectedTier.label });
          } else {
            setError('Payment received but verification failed. Contact support with payment ID: ' + response.razorpay_payment_id);
          }
          setLoading(false);
        },
      });

      rzp.open();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // Success screen
  if (success) {
    const expiry = success.accessExpiresAt
      ? new Date(success.accessExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'N/A';

    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-md rounded-2xl border border-white/8 bg-[#080808] p-10 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Access Granted!</h1>
            <p className="mt-2 text-sm text-white/40">
              {success.tvAccessGranted
                ? 'TradingView access has been activated for your account.'
                : 'Payment confirmed. Our team will grant TradingView access within 24 hours.'}
            </p>
            <div className="mt-8 space-y-3 rounded-xl border border-white/6 bg-white/[0.03] p-5 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/35">TradingView username</span>
                <span className="font-medium text-white">@{success.tradingViewUsername}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/35">Access valid until</span>
                <span className="font-medium text-white">{expiry}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/35">Plan</span>
                <span className="font-medium text-white">{success.tier}</span>
              </div>
            </div>
            <button onClick={() => router.push('/student/indicators')}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/92 active:scale-[0.98]">
              Go to Student Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  // Discord login gate
  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-sm rounded-2xl border border-white/8 bg-[#080808] p-10 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
              <Zap className="h-5 w-5 text-white/50" />
            </div>
            <h1 className="font-heading text-xl font-bold text-white">Sign in to continue</h1>
            <p className="mt-2 text-sm text-white/40">Connect your Discord account to purchase indicator access.</p>
            <button onClick={() => signIn('discord', { callbackUrl: '/indicators/purchase' })}
              className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-6 py-3 text-sm font-semibold text-[#8a9cf3] transition hover:bg-[#5865F2]/20 active:scale-[0.98]">
              <DiscIcon className="h-4 w-4" />
              Continue with Discord
            </button>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black selection:bg-white/15">
      <Navbar />

      <div className="relative overflow-hidden px-6 pt-28 pb-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,255,255,0.04),transparent)]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <Zap className="h-3 w-3" /> Quantum Indicator Suite
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
            <h1 className="mt-5 font-heading text-3xl font-bold text-white md:text-4xl">Get Indicator Access</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/35">
              Choose your plan, enter your TradingView username, and pay — access is activated instantly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">

        {/* Pricing error or loading */}
        {pricingError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{pricingError}</div>
        )}

        {pricingLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/30" />
          </div>
        )}

        {!pricingLoading && !pricingError && tiers.length === 0 && (
          <div className="rounded-xl border border-white/8 bg-[#080808] px-6 py-12 text-center">
            <p className="text-sm text-white/30">Pricing is not yet configured. Please check back soon.</p>
          </div>
        )}

        {!pricingLoading && tiers.length > 0 && (
          <>
            {/* Step 1: Billing period */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-white/8 bg-[#080808] p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">Step 1 — Access Period</p>
              <div className="grid grid-cols-3 gap-2">
                {PERIODS.map((p) => (
                  <button key={p.id} onClick={() => setPeriod(p.id)}
                    className={`rounded-xl border px-3 py-3 text-center transition-all ${period === p.id ? 'border-white/20 bg-white/[0.06]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 2: Choose plan */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-white/8 bg-[#080808] p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">Step 2 — Choose Your Plan</p>
              <div className="space-y-2">
                {tiers.map((t) => {
                  const price = getPeriodPrice(t, period);
                  return (
                    <button key={t.tier} onClick={() => setSelectedTier(t)}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition-all ${selectedTier?.tier === t.tier ? 'border-white/20 bg-white/[0.06]' : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{t.label}</p>
                          {t.description && <p className="mt-0.5 text-xs text-white/30 line-clamp-1">{t.description}</p>}
                          {t.features.length > 0 && (
                            <ul className="mt-2 space-y-0.5">
                              {t.features.map((f) => (
                                <li key={f} className="text-[11px] text-white/30">{f}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-white">{price > 0 ? formatPaise(price) : '—'}</p>
                          <p className="text-[10px] text-white/25">/{period.toLowerCase()}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Step 3: TradingView username */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-white/8 bg-[#080808] p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">Step 3 — TradingView Username</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/25 select-none">@</span>
                <input type="text" placeholder="your_tradingview_username" value={tvUsername}
                  onChange={(e) => { setTvUsername(e.target.value); setError(''); }}
                  className="w-full rounded-xl border border-white/8 bg-white/[0.03] py-3 pl-8 pr-4 text-sm text-white placeholder:text-white/20 transition focus:border-white/20 focus:bg-white/[0.05] focus:outline-none" />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/25">
                <Clock className="h-3 w-3" />
                Access is granted to this username once payment is confirmed.
              </p>
            </motion.div>

            {/* Summary + Pay */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-2xl border border-white/8 bg-[#080808] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/40">{selectedTier?.label ?? 'No plan selected'}</p>
                  <p className="text-[10px] text-white/20">{period.charAt(0) + period.slice(1).toLowerCase()} billing</p>
                </div>
                <p className="text-2xl font-bold text-white">{currentPrice > 0 ? formatPaise(currentPrice) : '—'}</p>
              </div>

              {error && (
                <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">{error}</p>
              )}

              <button onClick={handlePurchase} disabled={loading || !selectedTier || currentPrice <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/92 disabled:opacity-60 active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/60" />
                    Processing…
                  </span>
                ) : (
                  <>Pay {currentPrice > 0 ? formatPaise(currentPrice) : ''} with Razorpay <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-white/20">
                Secured by Razorpay · Access granted within minutes of payment
              </p>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
