import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'gold' | 'green' | 'red' | 'gray' | 'default' | 'secondary' | 'destructive' | 'outline';
  children: ReactNode;
  className?: string;
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  gold: 'bg-accent/10 text-accent border-primary/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  gray: 'bg-black/40 text-white/40 border-white/10',
  default: 'bg-[var(--accent)] text-black border-transparent',
  secondary: 'bg-white/10 text-white border-white/20',
  destructive: 'bg-red-600 text-white border-transparent',
  outline: 'bg-transparent text-white border-white/25',
};

export function Badge({ variant = 'gold', className = '', children, ...props }: BadgeProps & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
