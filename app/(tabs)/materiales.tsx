import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@/utils/contexts/ThemeContext';
import EditPrecio from '../(presupuestos)/editar/materiales/[tipo]';

export default function TabEditarPrecioScreen() {
  const {colors} = useTheme();
  const [precio, setPrecio] = useState('');

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={150}
      extraHeight={10}
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.containerKASV, {backgroundColor: colors.background}]}
      scrollEnabled={true}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View style={styles.container}>
          <EditPrecio
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>

  );
}

const styles = StyleSheet.create({
  containerKASV: {
    flexGrow: 1,
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
