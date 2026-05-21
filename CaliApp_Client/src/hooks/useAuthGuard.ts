import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export function useAuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return isAuthenticated;
}
