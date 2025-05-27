import Presupuestos from '@/components/ListarPresupuestos';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import EditPrecio from '@/components/EditPrecio';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function TabPresupuestos() {
  return (
        <View style={styles.container}>
          <Presupuestos path='' />
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
