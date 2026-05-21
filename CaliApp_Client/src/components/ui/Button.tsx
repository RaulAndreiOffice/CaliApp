import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium touch-manipulation',
        'transition-colors duration-[var(--d-fast,160ms)] ease-[var(--e-out,cubic-bezier(0.16,1,0.3,1))]',
        'disabled:opacity-40 disabled:pointer-events-none',
        'press-down',
        {
          'bg-primary text-primary-foreground glow-lime hover:brightness-110': variant === 'primary',
          'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80': variant === 'secondary',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'danger',
          'hover:bg-accent/50 hover:text-accent-foreground': variant === 'ghost',
          'px-3 py-2 text-sm min-h-[44px]': size === 'sm',
          'px-4 py-2.5 min-h-[44px]': size === 'md',
          'px-6 py-3 text-base sm:text-lg min-h-[52px]': size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
