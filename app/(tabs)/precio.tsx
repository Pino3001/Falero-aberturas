import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import EditPrecio from '@/components/EditPrecio';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function TabEditarPrecioScreen() {
  const [precio, setPrecio] = useState('');

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={150}
      extraHeight={10}
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.containerKASV}
      scrollEnabled={true}
    >
      <TouchableWithoutFeedback 
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View style={styles.container}>
          <EditPrecio 
            precio={precio}
            onPrecioChange={setPrecio}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  containerKASV: {
    flexGrow: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }
});
