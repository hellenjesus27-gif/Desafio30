import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useStore } from '../store';

// Paleta extraída da logo: preto, prata metálico e rosa.
export interface Palette {
  bg: string; card: string; cardAlt: string; text: string; textMuted: string;
  border: string; primary: string; primaryText: string; silver: string;
  success: string; warning: string; danger: string; gold: string; isDark: boolean;
}

export const dark: Palette = {
  bg: '#000000', card: '#111114', cardAlt: '#1A1A1F', text: '#F4F4F6', textMuted: '#9A9AA5',
  border: '#26262C', primary: '#E08CA5', primaryText: '#1A0A10', silver: '#C9CCD1',
  success: '#3DDC84', warning: '#F5B942', danger: '#FF5D6C', gold: '#F5C542', isDark: true,
};
export const light: Palette = {
  bg: '#F6F4F5', card: '#FFFFFF', cardAlt: '#F0ECEE', text: '#15151A', textMuted: '#6B6B76',
  border: '#E5E0E3', primary: '#C4506F', primaryText: '#FFFFFF', silver: '#8A8D94',
  success: '#1E9E5A', warning: '#C98A0B', danger: '#D93A4A', gold: '#C99A0B', isDark: false,
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

const Ctx = createContext<Palette>(dark);
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const pref = useStore((s) => s.themePref); // 'system' | 'light' | 'dark'
  const isDark = pref === 'system' ? system !== 'light' : pref === 'dark';
  const value = useMemo(() => (isDark ? dark : light), [isDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
