import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { refreshTokens } from '../../../api/axios';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * On a fresh page load the access token is gone — we deliberately never persist
 * it (XSS hardening). If the persisted store still believes we have a session,
 * silently re-mint the token from the httpOnly refresh cookie *before* rendering
 * the app, so we never flash protected content or fire doomed 401 requests.
 *
 * If the refresh fails (cookie expired/revoked), refreshTokens() already clears
 * the session, so rendering proceeds and the router falls through to /login.
 */
export function AuthBootstrap({ children }: Readonly<{ children: ReactNode }>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { t } = useLanguage();

  // Only bootstrap when we think we're logged in but the in-memory token is
  // missing — i.e. exactly the page-reload case. Computed once on mount.
  const [ready, setReady] = useState(() => !(isAuthenticated && !accessToken));

  useEffect(() => {
    if (ready) return;
    let active = true;
    refreshTokens()
      .catch(() => {
        /* logout is handled inside refreshTokens(); just stop blocking. */
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <LoadingSpinner label={t('common.loading')} />
      </div>
    );
  }

  return <>{children}</>;
}
