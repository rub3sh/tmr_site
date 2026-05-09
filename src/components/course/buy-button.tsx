'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/types/course';

interface BuyButtonProps {
  courseId: string;
  courseTitle: string;
  priceInPaise: number;
  currency: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function BuyButton({ courseId, courseTitle, priceInPaise, currency }: BuyButtonProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleBuy() {
    const userEmail = session?.user?.email || email;
    if (!userEmail) {
      setShowEmail(true);
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Failed to load payment gateway');
        return;
      }

      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, email: userEmail }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        alert(err.error || 'Failed to create order');
        return;
      }

      const { orderId, amount, currency: cur, keyId } = await orderRes.json();

      // Open Razorpay
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: cur,
        name: 'TheMarketRevelation',
        description: courseTitle,
        order_id: orderId,
        prefill: { email: userEmail },
        theme: { color: '#4F7BF7' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            window.location.href = '/dashboard';
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
      });
      rzp.open();
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {showEmail && !session && (
        <Input
          type="email"
          placeholder="Enter your Gmail ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email (for account creation)"
        />
      )}
      <Button onClick={handleBuy} loading={loading} className="w-full" size="lg">
        Buy Now — {formatPrice(priceInPaise, currency)}
      </Button>
    </div>
  );
}
