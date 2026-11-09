import { Platform } from 'react-native';

export const lightColors = {
  background: '#F3F6F4',
  card: '#FFFFFF',
  text: '#14201A',
  textMuted: '#5B6860',
  primary: '#1F7A4D',
  onPrimary: '#FFFFFF',
  border: '#D5DDD8',
  inputBg: '#FFFFFF',
  chip: '#E2EEE7',
  error: '#C62828',
  success: '#1F7A4D',
  warning: '#B26A00',
};

export const darkColors = {
  background: '#0F1512',
  card: '#1A231E',
  text: '#EAF1ED',
  textMuted: '#9AA9A0',
  primary: '#4CC38A',
  onPrimary: '#0B1A12',
  border: '#2C3A33',
  inputBg: '#141C18',
  chip: '#24332B',
  error: '#FF6B6B',
  success: '#4CC38A',
  warning: '#F2B04C',
};

export const palettes = { light: lightColors, dark: darkColors };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16 };

// Sombra do card: iOS usa shadow*, Android usa elevation, web usa boxShadow.
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  android: { elevation: 3 },
  default: { boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' },
});
