import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;          // ← convenience flag
  systemTheme: 'dark' | 'light' | null; // ← current resolved system preference
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to read from localStorage first
    const stored = localStorage.getItem(storageKey);
    if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
      return stored as Theme;
    }
    return defaultTheme;
  });

  // Resolve the actual applied theme (useful for UI indicators)
  const resolvedTheme = useMemo(() => {
    if (theme === 'system' && enableSystem) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme, enableSystem]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Always clean previous classes first
    root.classList.remove('light', 'dark');

    // Apply the resolved theme
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [resolvedTheme]);

  // Listen for system preference changes (only when theme = 'system')
  useEffect(() => {
    if (theme !== 'system' || !enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Force re-render by updating resolvedTheme indirectly
      setThemeState((prev) => prev); // dummy update to trigger effect
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);

  const value: ThemeProviderState = useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
      },
      isDark: resolvedTheme === 'dark',
      systemTheme: enableSystem
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : null,
    }),
    [theme, resolvedTheme, enableSystem, storageKey]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}