import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <div className="text-muted-foreground/30 mb-5 float">{icon ?? <Inbox size={52} />}</div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted-foreground/70 mb-5 max-w-xs">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
