import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'reps' | 'time';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = 'default', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md',
        {
          'bg-[#22c55e]/15 text-[#22c55e]': variant === 'success',
          'bg-[#f97316]/15 text-[#f97316]': variant === 'warning',
          'bg-destructive/15 text-destructive': variant === 'danger',
          'bg-[#3b82f6]/15 text-[#3b82f6]': variant === 'info',
          'bg-muted/50 text-muted-foreground': variant === 'default',
          'bg-primary/15 text-primary': variant === 'reps',
          'bg-[#06b6d4]/15 text-[#06b6d4]': variant === 'time',
        },
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-[#22c55e]': variant === 'success',
            'bg-[#f97316]': variant === 'warning',
            'bg-destructive': variant === 'danger',
            'bg-[#3b82f6]': variant === 'info',
            'bg-muted-foreground': variant === 'default',
            'bg-primary': variant === 'reps',
            'bg-[#06b6d4]': variant === 'time',
          })}
        />
      )}
      {children}
    </span>
  );
}
