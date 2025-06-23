import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeContextProvider, useTheme } from '../utils/contexts/ThemeContext';
import { BDProvider } from '@/utils/contexts/BDContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      {/* Pantalla de tabs - sin header (se manejará internamente) */}
      <Stack.Screen name="(presupuestos)/(tabs)" />

      {/* Pantalla de edición - con header personalizado */}
      <Stack.Screen
        name="(presupuestos)/editar/[id]"
        options={{
          title: 'Editar Presupuesto',
          presentation: 'card',
          headerBackTitle: 'Atrás',
          animation: 'slide_from_bottom',
          gestureEnabled: false,
          headerShown: true,
          headerTransparent: true,
        }}
      />

      {/* Modal de opciones - con header modal */}
      <Stack.Screen
        name="(presupuestos)/componentes/modales/opciones"
        options={{
          title: 'Opciones',
          presentation: 'modal',
          headerShown: true,
          headerLeft: () => null
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeContextProvider>
          <BDProvider>
            <RootLayoutNav />
          </BDProvider>
        </ThemeContextProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}