import { StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import EditScreenInfo from '@/components/EditNuevoPresupuesto';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView style={{ width: '100%', height: '100%' }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.container}>
          <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flex: 1,
    paddingTop: 40,
    width: '100%',
    height: '100%'
  },
  scrollContent: {
    flexGrow: 1, // Hace que el contenido ocupe el 100% si es necesario
  },
  innerContent: {
    flex: 1, // Opcional: si quieres que el contenido interno también expanda
    minHeight: '80%', // Alternativa para asegurar el alto completo
  },
  containerKASV: {
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
