import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/NavigatorContainer';
import { initDatabase } from './src/storage/database';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <AppNavigator />
  );
}
