import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        type="button"
        className="p-2.5 rounded-xl border border-border/50 bg-card/80 hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-muted-foreground/80 font-medium tabular-nums px-2">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="p-2.5 rounded-xl border border-border/50 bg-card/80 hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
