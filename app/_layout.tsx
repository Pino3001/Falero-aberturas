import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeContextProvider, useTheme } from '../utils/contexts/ThemeContext';
import { BDProvider } from '@/utils/contexts/BDContext';

function RootLayoutNav() {
  const { currentTheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.colors.surface,
        },
        headerTintColor: currentTheme.colors.onSurface,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="modalOpciones" 
        options={{ 
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContextProvider>
        <BDProvider>
          <RootLayoutNav />
        </BDProvider>
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
}