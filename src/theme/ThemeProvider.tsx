import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppSettings,
  LayoutDensity,
  ThemeMode,
  getSettings,
  saveSettings,
} from '../storage/settingsStorage';
import { AppTheme, createAppTheme } from './theme';

type ThemeContextValue = {
  settings: AppSettings;
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLayoutDensity: (density: LayoutDensity) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    themeMode: 'light',
    layoutDensity: 'comfortable',
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const stored = await getSettings();

      if (isMounted) {
        setSettings(stored);
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = createAppTheme(settings.themeMode, settings.layoutDensity);

    return {
      settings,
      theme,
      setThemeMode: async (mode) => {
        const next = await saveSettings({ themeMode: mode });
        setSettings(next);
      },
      setLayoutDensity: async (density) => {
        const next = await saveSettings({ layoutDensity: density });
        setSettings(next);
      },
    };
  }, [settings]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return context;
};
