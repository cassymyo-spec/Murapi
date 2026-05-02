import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/NavigatorContainer';
import { initDatabase } from './src/storage/database';
import { AppThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <AppThemeProvider>
      <AppNavigator />
    </AppThemeProvider>
  );
}
