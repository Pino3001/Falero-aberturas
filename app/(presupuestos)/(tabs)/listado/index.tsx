import { useTheme } from '@/utils/contexts/ThemeContext';
import Presupuestos from '../../componentes/ListaPresupuestos';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabPresupuestos() {
      const { colors } = useTheme();
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  containerKASV: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Presupuestos path='' />
      </View>
    </GestureHandlerRootView>
  );
}


