import { NavLink } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  ClipboardList,
  Activity,
  Target,
  Sparkles,
  Share2,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../stores/auth.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { TranslationKey } from '../../../i18n/translations';

const NAV_ITEMS: { to: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { to: '/dashboard', labelKey: 'nav.dashboardFull', icon: Home },
  { to: '/exercises', labelKey: 'nav.exercises', icon: Dumbbell },
  { to: '/workout-tables', labelKey: 'nav.plans', icon: ClipboardList },
  { to: '/workout-sessions', labelKey: 'nav.sessions', icon: Activity },
  { to: '/goals', labelKey: 'nav.goals', icon: Target },
  { to: '/ai-coach', labelKey: 'nav.aiCoach', icon: Sparkles },
  { to: '/shared-with-me', labelKey: 'nav.shared', icon: Share2 },
  { to: '/profile', labelKey: 'nav.settings', icon: Settings },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex w-60 h-full bg-sidebar border-r border-sidebar-border flex-col hairline relative z-10">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-mark.png"
            alt="CaliAPP"
            className="h-7 w-auto"
          />
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            CaliAPP
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-[-0.01em]',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground glow-lime'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/profile"
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-mono font-semibold text-sm text-[var(--ink-0)]"
            style={{ background: 'linear-gradient(135deg, var(--lime-400), var(--accent-blue))' }}
          >
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium leading-tight">{user?.username ?? t('nav.guest')}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user?.email ?? ''}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </NavLink>
      </div>
    </aside>
  );
}
