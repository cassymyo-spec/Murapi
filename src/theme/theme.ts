import { LayoutDensity, ThemeMode } from '../storage/settingsStorage';

export type AppTheme = {
  mode: ThemeMode;
  density: LayoutDensity;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryContrast: string;
    dangerSurface: string;
    dangerBorder: string;
    dangerText: string;
  };
  spacing: {
    screen: number;
    section: number;
    card: number;
  };
  statusBarStyle: 'dark-content' | 'light-content';
};

export const createAppTheme = (
  mode: ThemeMode,
  density: LayoutDensity
): AppTheme => {
  const isDark = mode === 'dark';

  return {
    mode,
    density,
    colors: {
      background: isDark ? '#101214' : '#ffffff',
      surface: isDark ? '#181b1f' : '#ffffff',
      surfaceMuted: isDark ? '#1f2328' : '#f5f5f5',
      border: isDark ? '#2a2f36' : '#e8e8e8',
      text: isDark ? '#f6f7f8' : '#000000',
      textMuted: isDark ? '#a4adb8' : '#888888',
      primary: isDark ? '#f6f7f8' : '#000000',
      primaryContrast: isDark ? '#101214' : '#ffffff',
      dangerSurface: isDark ? '#2b1a1a' : '#fff8f0',
      dangerBorder: isDark ? '#593131' : '#ffcc80',
      dangerText: isDark ? '#ffd7cc' : '#b45309',
    },
    spacing: {
      screen: density === 'compact' ? 20 : 28,
      section: density === 'compact' ? 10 : 12,
      card: density === 'compact' ? 14 : 16,
    },
    statusBarStyle: isDark ? 'light-content' : 'dark-content',
  };
};
