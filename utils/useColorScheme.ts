import { useTheme } from './contexts/ThemeContext'
import { ColorSchemeName } from 'react-native';

export function useColorScheme(): ColorSchemeName {
    const { theme } = useTheme(); // Usa tu contexto personalizado
    return theme;
}
