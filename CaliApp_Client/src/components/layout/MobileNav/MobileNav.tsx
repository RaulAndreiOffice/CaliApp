import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Dumbbell, Activity, User } from 'lucide-react';
import { cn } from '../../../utils/cn';

const ITEMS = [
  { to: '/dashboard', label: 'Acasă', icon: Home },
  { to: '/workout-tables', label: 'Planuri', icon: ClipboardList },
  { to: '/exercises', label: 'Exerciții', icon: Dumbbell },
  { to: '/workout-sessions', label: 'Sesiuni', icon: Activity },
  { to: '/profile', label: 'Profil', icon: User },
];

export function MobileNav() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border hairline z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav className="flex items-center justify-around px-1 py-1.5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors duration-[var(--d-fast,160ms)] relative touch-manipulation',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'relative',
                  isActive && 'drop-shadow-[0_0_8px_rgba(132,255,0,0.4)]'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>{label}</span>
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
