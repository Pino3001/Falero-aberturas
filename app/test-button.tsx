// app/test-button.tsx
import { View, TouchableOpacity, Text, Alert } from 'react-native';

export default function TestButton() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => Alert.alert('¡Botón funcional!')}
        style={{ padding: 20, backgroundColor: 'red' }}
      >
        <Text style={{ color: 'white' }}>PRESIONA AQUÍ</Text>
      </TouchableOpacity>
    </View>
  );
}