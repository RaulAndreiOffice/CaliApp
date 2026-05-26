import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InfoTooltipProps {
  label: string;
  content: string;
  /** Tailwind width class for the bubble, default w-56. */
  widthClass?: string;
}

/**
 * Small explanatory tooltip anchored to an Info icon. The trigger is a real
 * button so it shows up on focus (keyboard) and tap (mobile), not only on
 * hover — the previous group-hover-only pattern hid the content from anyone
 * not using a mouse. The bubble is the button's accessible description.
 */
export function InfoTooltip({ label, content, widthClass = 'w-56' }: Readonly<InfoTooltipProps>) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-muted-foreground/60 hover:text-foreground focus:text-foreground rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'absolute left-0 bottom-full mb-1 p-2 bg-card border border-border rounded-lg shadow-lg text-[11px] font-normal text-foreground z-50 pointer-events-none transition-opacity duration-150',
          widthClass,
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
