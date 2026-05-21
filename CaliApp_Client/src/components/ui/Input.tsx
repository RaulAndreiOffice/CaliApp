import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type = 'text', className = '', id, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    const inputId = id ?? rest.name;

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
            className={cn(
              'w-full px-4 py-3 bg-input-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground/60',
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
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors bg-transparent"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ascunde parola' : 'Arata parola'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error ? (
          <span className="text-sm text-destructive">{error}</span>
        ) : hint ? (
          <span className="text-sm text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
