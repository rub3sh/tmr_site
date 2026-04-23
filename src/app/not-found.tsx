import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-heading font-bold text-gradient-accent">404</h1>
        <p className="text-xl text-white/40">This page doesn&apos;t exist</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
