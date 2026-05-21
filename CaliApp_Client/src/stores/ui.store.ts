import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

type Theme = 'light' | 'dark';

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
    }
  )
);
