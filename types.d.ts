import { MD3Theme } from 'react-native-paper';
import { Theme as NavigationTheme } from '@react-navigation/native';
import { CombinedDefaultTheme } from './ruta/a/tu/archivo/de/temas'; // Ajusta la ruta

declare module 'react-native-paper' {
  interface MD3Theme {
    fonts: typeof CombinedDefaultTheme.fonts;
  }
}

declare module '@react-navigation/native' {
  interface Theme {
    fonts: {
      regular: { fontFamily: string };
      medium: { fontFamily: string };
      bold: { fontFamily: string };
    };
  }
}