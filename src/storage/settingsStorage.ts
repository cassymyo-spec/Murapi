import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type LayoutDensity = 'comfortable' | 'compact';

export type AppSettings = {
  themeMode: ThemeMode;
  layoutDensity: LayoutDensity;
};

const SETTINGS_KEY = 'murapi_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'light',
  layoutDensity: 'comfortable',
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const rawValue = await AsyncStorage.getItem(SETTINGS_KEY);

    if (!rawValue) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(rawValue) as Partial<AppSettings>;

    return {
      themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
      layoutDensity: parsed.layoutDensity === 'compact' ? 'compact' : 'comfortable',
    };
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (
  updates: Partial<AppSettings>
): Promise<AppSettings> => {
  const current = await getSettings();
  const next = {
    ...current,
    ...updates,
  };

  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Error saving settings:', error);
  }

  return next;
};
