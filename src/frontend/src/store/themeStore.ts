import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme modes
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme store state and actions
 */
interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

/**
 * Theme store with localStorage persistence
 * Manages light/dark mode state across the application
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      
      /**
       * Set theme mode explicitly
       */
      setMode: (mode: ThemeMode) => {
        set({ mode });
        // Apply theme class to document
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      /**
       * Toggle between light and dark mode
       */
      toggleMode: () => {
        set((state) => {
          const newMode = state.mode === 'dark' ? 'light' : 'dark';
          // Apply theme class to document
          if (newMode === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { mode: newMode };
        });
      },
    }),
    {
      name: 'archflow-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme class on initial load
        if (state?.mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
