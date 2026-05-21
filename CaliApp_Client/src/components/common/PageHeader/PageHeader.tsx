import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
