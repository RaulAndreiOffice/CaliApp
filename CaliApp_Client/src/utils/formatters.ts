export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'azi';
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `acum ${diffDays} zile`;
  if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} sapt`;
  return formatDate(isoString);
}

export function formatValue(value: number, type: 'reps' | 'time'): string {
  if (type === 'time') return `${value}s`;
  return `${value} rep`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
