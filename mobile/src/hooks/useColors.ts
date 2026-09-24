import colors from '@/theme/colors';
import { useTheme } from '@/context/ThemeContext';

/** Tokens de color de la paleta activa (oscura por defecto) más el radio de borde. */
export function useColors() {
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
