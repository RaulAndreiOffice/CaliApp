import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Dumbbell, Activity, User } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { TranslationKey } from '../../../i18n/translations';

const ITEMS: { to: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: Home },
  { to: '/workout-tables', labelKey: 'nav.plans', icon: ClipboardList },
  { to: '/exercises', labelKey: 'nav.exercises', icon: Dumbbell },
  { to: '/workout-sessions', labelKey: 'nav.sessions', icon: Activity },
  { to: '/profile', labelKey: 'nav.profile', icon: User },
];

export function MobileNav() {
  const { t } = useLanguage();
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border hairline z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav className="flex items-center justify-around px-1 py-1.5">
        {ITEMS.map(({ to, labelKey, icon: Icon }) => (
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
                )}>{t(labelKey)}</span>
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
