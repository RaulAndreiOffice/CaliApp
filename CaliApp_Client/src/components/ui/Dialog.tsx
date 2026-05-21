import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, children, footer, onClose }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-[100] p-2 sm:p-4 overflow-y-auto fade-in"
      style={{ minHeight: '100dvh' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col glass rounded-2xl shadow-xl scale-in my-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/30">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl bg-transparent transition-colors duration-[var(--d-fast,160ms)] min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={onClose}
            aria-label="Inchide"
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
