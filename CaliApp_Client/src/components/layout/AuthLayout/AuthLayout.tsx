import { Outlet } from 'react-router-dom';
import { Aurora } from '../Aurora/Aurora';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden isolate">
      <Aurora />

      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 animate-rise">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3 sm:mb-4">
            <img
              src="/logo-mark.png"
              alt="CaliAPP"
              className="h-10 w-auto"
            />
            <span
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            >
              CaliAPP
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 sm:p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
