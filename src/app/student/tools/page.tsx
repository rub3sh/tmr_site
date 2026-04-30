import { TradingHub } from '@/components/tools/trading-hub';

export default function StudentToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">The Desk</h1>
        <p className="mt-1 text-sm text-white/40">Essential trading tools — position sizing, calendar, and market sentiment</p>
      </div>
      <TradingHub />
    </div>
  );
}
