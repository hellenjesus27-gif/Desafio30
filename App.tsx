import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { ThemeProvider, useTheme } from './src/theme';
import { useStore } from './src/store';

function Root() {
  const t = useTheme();
  const ready = useStore((s) => s.ready);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      {ready ? <Navigation /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={t.primary} /></View>}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
