import { StyleSheet, Keyboard, View } from 'react-native';
import { useTheme } from '@/utils/contexts/ThemeContext';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import NuevoPresupuesto from '../(presupuestos)/componentes/NuevoPresupuesto';

export default function TabOneScreen() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable
        onPress={Keyboard.dismiss}
        style={{ flex: 1 }}
        android_disableSound={true}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <NuevoPresupuesto />
        </View>
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
});
