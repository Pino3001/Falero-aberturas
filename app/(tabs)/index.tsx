import { StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, View } from 'react-native';
import EditScreenInfo from '../EditNuevoPresupuesto';
import { useTheme } from '@/utils/contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabOneScreen() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  containerKASV: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
