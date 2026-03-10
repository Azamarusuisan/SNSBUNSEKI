'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500': variant === 'primary',
            'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50': variant === 'secondary',
            'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
