import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm text-foreground font-medium">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 bg-input-background/80 border border-input/60 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 focus:shadow-[0_0_16px_rgba(132,255,0,0.1)] cursor-pointer min-h-[44px] transition-all duration-200 appearance-none',
            error && 'border-destructive/60 focus:ring-destructive/30',
            className
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
