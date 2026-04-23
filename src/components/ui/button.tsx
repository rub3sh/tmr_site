'use client';

import { Slot } from '@radix-ui/react-slot';
import { ButtonHTMLAttributes, MouseEvent, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'default'
  | 'destructive'
  | 'outline'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg' | 'default' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98]',
  secondary:
    'bg-white/5 text-white border border-white/10 hover:border-white/20 hover:text-white',
  ghost: 'bg-transparent text-white/50 hover:text-white hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  default:
    'bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98]',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'bg-transparent text-white border border-white/15 hover:border-white/30 hover:bg-white/5',
  link: 'bg-transparent p-0 h-auto text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  default: 'px-6 py-3 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = Boolean(disabled || loading);
    const childDisabledProps = asChild
      ? {
          'aria-disabled': isDisabled,
          tabIndex: isDisabled ? -1 : props.tabIndex,
          onClick: isDisabled
            ? (e: MouseEvent<HTMLElement>) => {
                e.preventDefault();
                e.stopPropagation();
              }
            : props.onClick,
        }
      : {};

    return (
      <Comp
        ref={ref}
        disabled={!asChild ? isDisabled : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed',
          asChild && isDisabled && 'pointer-events-none opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
        {...childDisabledProps}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
