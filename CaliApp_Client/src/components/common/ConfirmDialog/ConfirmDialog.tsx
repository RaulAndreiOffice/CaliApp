import { useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 fade-in">
      <button
        type="button"
        aria-label={cancelLabel ?? t('common.cancel')}
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />
      <div
        className="glass rounded-2xl p-6 w-full max-w-md shadow-xl scale-in relative z-10"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground/80 mb-5">{description}</p>
        )}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors duration-[var(--d-fast,160ms)] press-down"
            onClick={onCancel}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-[var(--d-fast,160ms)] press-down ${
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
