import { useColorScheme } from 'react-native';

const light = {
  bg: '#F6F4F0',
  surface: '#FFFFFF',
  text: '#1F1E1B',
  textSoft: '#6B6860',
  line: '#E4E0D8',
  accent: '#3F6B57',
  onAccent: '#FFFFFF',
  alert: '#B5573A',
};

const dark: typeof light = {
  bg: '#141413',
  surface: '#1E1E1C',
  text: '#ECEAE4',
  textSoft: '#9B978D',
  line: '#2E2D2A',
  accent: '#7FAF98',
  onAccent: '#141413',
  alert: '#D9856A',
};

export type Colors = typeof light;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;
export const radius = { sm: 8, md: 12, lg: 16 } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
