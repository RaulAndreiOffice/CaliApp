import { useState, type KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SetInputProps {
  setNumber: number;
  initialValue?: number;
  measurementType: 'reps' | 'time';
  completed?: boolean;
  onSubmit: (value: number) => void;
}

export function SetInput({
  setNumber,
  initialValue,
  measurementType,
  completed,
  onSubmit,
}: Readonly<SetInputProps>) {
  const { t } = useLanguage();
  const [value, setValue] = useState<string>(
    initialValue !== undefined ? String(initialValue) : ''
  );

  function commit() {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) {
      onSubmit(num);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  }

  const placeholder = measurementType === 'time'
    ? t('workout.setInput.unit.time')
    : t('workout.setInput.unit.reps');
  const unitShort = measurementType === 'time'
    ? t('workout.setInput.unitShort.time')
    : t('workout.setInput.unitShort.reps');

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-colors duration-[var(--d-fast,160ms)]',
      completed
        ? 'border-[#22c55e]/40 bg-[#22c55e]/5'
        : 'border-border bg-muted/20 hover:bg-muted/30'
    )}>
      <span className="text-sm font-semibold min-w-[55px] text-muted-foreground font-mono">{t('sessions.card.set')} {setNumber}</span>
      <input
        type="number"
        inputMode="numeric"
        className="flex-1 p-2 border border-border rounded-xl bg-background text-lg font-bold font-mono text-center w-20 max-w-[120px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(132,255,0,0.15)] transition-all duration-[var(--d-fast,160ms)] tabular-nums"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        min={0}
        placeholder={placeholder}
        aria-label={`${t('sessions.card.set')} ${setNumber}`}
      />
      <span className="text-xs text-muted-foreground/60 font-medium">
        {unitShort}
      </span>
      <span className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-[var(--d-base,240ms)]',
        completed
          ? 'bg-[#22c55e] text-white animate-pop'
          : 'bg-muted/20 text-muted-foreground/30'
      )}>
        <Check size={14} />
      </span>
    </div>
  );
}
