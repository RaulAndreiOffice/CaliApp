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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[calc(100vh-2rem)] flex flex-col glass rounded-2xl shadow-xl scale-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
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
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 px-6 py-4 border-t border-border/30">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
