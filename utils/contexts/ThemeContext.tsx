import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ColorSchemeName, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, adaptNavigationTheme, configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import {
  useFonts,
  RobotoSlab_400Regular,
  RobotoSlab_700Bold
} from '@expo-google-fonts/roboto-slab';
import { robotoSlab, robotoSlabFont } from './fonts';




// Adaptación de los temas de navegación
const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});


// Definición completa del tema claro
const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...AdaptedLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...AdaptedLightTheme.colors,
    primary: '#3E7D6D',           // Verde azulado oscuro
    onPrimary: '#FFFFFF',         // Blanco
    primaryContainer: '#C8E8DE',  // Verde azulado claro
    onPrimaryContainer: '#1A4A3F',// Verde azulado muy oscuro
    secondary: '#D77A61',         // Terracota
    onSecondary: '#FFFFFF',       // Blanco
    secondaryContainer: '#FFE0D6',// Terracota claro
    onSecondaryContainer: '#5C2A21', // Terracota oscuro
    tertiary: '#6B8E23',          // Verde oliva (opcional)
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#D8E6C5', // Verde clario
    onTertiaryContainer: '#213600', // verde muy oscuro
    error: '#BA1B1B',             // Rojo error
    onError: '#FFFFFF',
    errorContainer: '#FFDAD4',    // rosa
    onErrorContainer: '#410001',  // bordo oscuro
    background: '#F5FAEF',        // Fondo verde claro F5FAEF
    onBackground: '#1E1E1E',      // Texto oscuro
    surface: '#ECF1E2',           // Superficie principal EBF7D0
    onSurface: '#1E1E1E',         // Texto sobre superficie
    surfaceVariant: '#E0E5D6',    // Variante de superficie
    onSurfaceVariant: '#444746',  // Texto sobre variante
    outline: '#6F797A',           // Bordes
    outlineVariant: '#BFC9C9',    // Variante de bordes
    inverseSurface: '#2D3130',    // Para modos invertidos
    inverseOnSurface: '#F5F9F3',  // clarito como el fondo
    inversePrimary: '#6BB4C5',    // Azul claro
    shadow: '#000000',            // Sombras
    scrim: '#000000',             // Overlays
    elevation: {
      level0: 'transparent',
      level1: '#F5FAEF',          // Elevación 1
      level2: '#F0F5EA',          // Elevación 2
      level3: '#EBF0E5',          // Elevación 3
      level4: '#E6EBE0',          // Elevación 4
      level5: '#E1E6DB',          // Elevación 5
    },
  },
  fonts: configureFonts({
    config: robotoSlab,
    isV3: true,
  }),
};



// Definición del tema oscuro
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...AdaptedDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...AdaptedDarkTheme.colors,
    primary: '#6BB4C5',           // Azul claro
    onPrimary: '#00363D',
    primaryContainer: '#004F59',
    onPrimaryContainer: '#A4EEFF',
    secondary: '#FFB59E',         // Terracota claro
    onSecondary: '#5C1907',
    secondaryContainer: '#7D2D1A',
    onSecondaryContainer: '#FFDAD0',
    tertiary: '#B7CC8F',          // Verde oliva claro
    onTertiary: '#243700',
    tertiaryContainer: '#364F00',
    onTertiaryContainer: '#D3E9A8',
    error: '#FFB4A9',
    onError: '#680003',
    errorContainer: '#930006',
    onErrorContainer: '#FFDAD4',
    background: '#121212',        // Fondo oscuro
    onBackground: '#E0E3DD',
    surface: '#1E1E1E',           // Superficie principal oscura
    onSurface: '#E0E3DD',
    surfaceVariant: '#3F484A',
    onSurfaceVariant: '#BEC8CA',
    outline: '#899294',
    outlineVariant: '#3F484A',
    inverseSurface: '#E0E3DD',
    inverseOnSurface: '#2D3130',
    inversePrimary: '#006874',
    shadow: '#000000',
    scrim: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#1E2424',          // Elevación 1 oscura
      level2: '#232A2A',          // Elevación 2 oscura
      level3: '#283030',          // Elevación 3 oscura
      level4: '#2C3535',          // Elevación 4 oscura
      level5: '#313B3B',          // Elevación 5 oscura
    },
  },
  fonts: configureFonts({
    config: robotoSlab,
    isV3: true,
  }),
};
console.log("CombinedDefaultTheme.fonts", JSON.stringify(CombinedDefaultTheme.fonts));
// Tipado del contexto del tema
type AppTheme = typeof CombinedDefaultTheme;

type ThemeContextType = {
  theme: ColorSchemeName;
  currentTheme: AppTheme;
  fonts: typeof robotoSlabFont;
  toggleTheme: () => void;
  colors: AppTheme['colors'];
  setTheme: (theme: ColorSchemeName) => void;
};

// Creación del contexto
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  currentTheme: CombinedDefaultTheme,
  colors: CombinedDefaultTheme.colors,
  fonts: robotoSlabFont,
  toggleTheme: () => { },
  setTheme: () => { },
});

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeContextProvider');
  }
  return context;
};

// Proveedor del tema
export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded] = useFonts({
    'RobotoSlab-Regular': RobotoSlab_400Regular,
    'RobotoSlab-Bold': RobotoSlab_700Bold,
  });

  const [theme, setTheme] = useState<ColorSchemeName>('light');

  const currentTheme = useMemo(() =>
    theme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme,
    [theme]
  );

  useEffect(() => {
    if (fontsLoaded) {
      console.log('Fuentes cargadas:', {
        'RobotoSlab-Regular': !!RobotoSlab_400Regular,
        'RobotoSlab-Bold': !!RobotoSlab_700Bold,
      });
    }
  }, [fontsLoaded]);
  // Efectos para cargar/guardar el tema
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) setTheme(savedTheme as ColorSchemeName);
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('appTheme', theme ?? 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!fontsLoaded) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: currentTheme.colors.background
      }}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, colors: currentTheme.colors, fonts: robotoSlabFont, toggleTheme, setTheme }}>
      <PaperProvider theme={currentTheme}>
        <ThemeProvider
          value={{
            ...currentTheme,
            fonts: robotoSlabFont
          }}
        >
          {children}
        </ThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};