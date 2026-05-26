import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type = 'text', className = '', id, ...rest }, ref) => {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;

    // Stable id per Input instance so the label/aria-describedby links work
    // even when the consumer doesn't pass id or name (e.g. uncontrolled forms).
    const reactId = useId();
    const inputId = id ?? rest.name ?? reactId;
    const helperId = `${inputId}-helper`;
    const helperText = error ?? hint;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm text-foreground font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            aria-invalid={error ? true : undefined}
            aria-describedby={helperText ? helperId : undefined}
            className={cn(
              'w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60',
              'focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(132,255,0,0.15)]',
              'min-h-[44px] text-base transition-all duration-[var(--d-fast,160ms)]',
              error && 'border-destructive focus:border-destructive focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]',
              isPassword && 'pr-12',
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded transition-colors bg-transparent"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('input.hidePassword') : t('input.showPassword')}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {helperText && (
          <span
            id={helperId}
            className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
