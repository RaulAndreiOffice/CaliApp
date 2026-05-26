import { useEffect, useId } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const { t } = useLanguage();
  const titleId = useId();
  const descId = useId();
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <button
        type="button"
        aria-label={cancelLabel ?? t('common.cancel')}
        className="absolute inset-0 bg-black/60 cursor-default focus:outline-none"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        className="glass rounded-lg p-6 w-full max-w-md shadow-xl scale-in relative z-10 focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <h3 id={titleId} className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p id={descId} className="text-sm text-muted-foreground/80 mb-5">{description}</p>
        )}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors duration-[var(--d-fast,160ms)] press-down focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={onCancel}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-[var(--d-fast,160ms)] press-down focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              variant === 'danger'
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground glow-lime hover:brightness-110'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
