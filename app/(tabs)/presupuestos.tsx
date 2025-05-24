import { StyleSheet } from 'react-native';

import Presupuestos from '@/components/ListarPresupuestos';
import { Text, View } from '@/components/Themed';

export default function TabPresupuestos() {
  return (
    <View style={styles.container}>
      <Presupuestos path="app/(tabs)/presupuestos.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
