import { LightTheme } from '../theme/light';
import { DarkTheme } from '../theme/dark';
import { useColorScheme } from 'react-native';

export default function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkTheme : LightTheme;
}
