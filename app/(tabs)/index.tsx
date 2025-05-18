import { StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import EditScreenInfo from '@/components/EditNuevoPresupuesto';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <ScrollView style={{width: '100%'}}>
    <KeyboardAwareScrollView // Para que el textImput no quede oculto por el teclado
      enableOnAndroid={true}
      extraScrollHeight={0}
      contentContainerStyle={styles.containerKASV}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback // Para que pueda cerrar el teclado o cualquier menu al tocar cualquier parte de la pantalla
      onPress={Keyboard.dismiss} 
      accessible={false}
      >  
        <View style={styles.container}>
          <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: 40,
    width:'100%'
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
