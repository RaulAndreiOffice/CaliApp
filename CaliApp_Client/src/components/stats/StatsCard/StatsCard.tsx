import type { ReactNode } from 'react';
import { Card, CardContent } from '../../ui/Card';

interface StatsCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: number; suffix?: string };
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({ label, value, delta, icon, iconColor = 'text-primary', iconBg = 'bg-primary/10' }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-3 sm:pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {icon && (
            <div className={`p-2.5 sm:p-3 rounded-xl ${iconBg}`}>
              <div className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`}>{icon}</div>
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground/70 font-medium">{label}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight font-mono">{value}</p>
            {delta !== undefined && (
              <p className={`text-xs font-semibold ${delta.value >= 0 ? 'text-[#22c55e]' : 'text-destructive'}`}>
                {delta.value >= 0 ? '+' : ''}
                {delta.value}
                {delta.suffix ?? ''}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
