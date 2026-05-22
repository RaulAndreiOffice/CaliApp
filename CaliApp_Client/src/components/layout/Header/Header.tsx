import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { useLogout } from '../../../hooks/api/useAuth';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    });
  }

  return (
    <header className="hidden md:flex sticky top-0 z-30 w-full shrink-0 items-center gap-3 h-14 px-6 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-2">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center font-mono font-semibold text-sm text-[var(--ink-0)]"
          style={{ background: 'linear-gradient(135deg, var(--lime-400), var(--accent-blue))' }}
        >
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="text-sm font-medium hidden sm:inline text-foreground/90">{user?.username ?? 'Guest'}</span>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-[var(--d-fast,160ms)] bg-transparent press-down"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
