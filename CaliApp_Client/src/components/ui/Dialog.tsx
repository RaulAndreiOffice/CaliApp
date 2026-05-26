import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, children, footer, onClose }: Readonly<DialogProps>) {
  const { t } = useLanguage();
  const titleId = useId();
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 fade-in"
      style={{ minHeight: '100dvh' }}
    >
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/60 cursor-default focus:outline-none"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-[480px] max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col glass rounded-lg shadow-xl scale-in my-auto focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="flex shrink-0 items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/30">
          <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg bg-transparent transition-colors duration-[var(--d-fast,160ms)] min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer && (
          <footer className="flex shrink-0 justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
