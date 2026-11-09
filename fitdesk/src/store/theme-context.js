import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes } from '../constants/theme';

const STORAGE_KEY = '@theme';
const ThemeContext = createContext(null);

// mode: 'system' (segue o aparelho), 'light' ou 'dark'
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setMode(saved);
        }
      } catch (error) {
        console.warn('Falha ao ler o tema salvo:', error);
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, mode).catch((error) =>
      console.warn('Falha ao salvar o tema:', error)
    );
  }, [mode, isLoaded]);

  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({ mode, setMode, scheme, isDark: scheme === 'dark', colors: palettes[scheme], isLoaded }),
    [mode, scheme, isLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider.');
  }
  return ctx;
}
