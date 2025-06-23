import { SafeAreaView } from 'react-native';
import NuevoPresupuesto from '../componentes/NuevoPresupuesto';

export default function EditPresupuestoScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NuevoPresupuesto />
    </SafeAreaView>
  );
}