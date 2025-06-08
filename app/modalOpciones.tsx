import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Button, Dialog } from 'react-native-paper';
import { DatabaseManager, dropTables, initializeDatabase } from '@/utils/utilsDB';
import Colors from '@/utils/constants/Colors';
import { Stack } from 'expo-router'; // Importa Stack de expo-router
import DialogComponent from '@/components/DialogComponent';
import { useState } from 'react';

export default function ModalScreen() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImporttDialog, setShowImportDialog] = useState(false);
  const [showRestoreBack, setShowRestoreBack] = useState(false);
  return (
    <>
      {/* Configuración del header del modal */}
      <Stack.Screen
        options={{
          title: 'Opciones Generales', // Título personalizado
          headerStyle: {
            backgroundColor: Colors.colors.background,
          },
          headerTintColor: Colors.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <View style={styles.container}>

        <Button
          style={styles.buttonStyle}
          labelStyle={{ fontSize: 16 }}
          textColor={Colors.colors.text}
          onPress={async () => {
            await dropTables();
            await initializeDatabase();
          }}>
          Eliminar DB
        </Button>

        <Button
          style={styles.buttonStyle}
          labelStyle={{ fontSize: 16 }}
          textColor={Colors.colors.text}
          onPress={async () => {
            await DatabaseManager.createBackup();
          }}>
          Crear Backup
        </Button>

        <Button
          style={styles.buttonStyle}
          labelStyle={{ fontSize: 16 }}
          textColor={Colors.colors.text}
          onPress={() => {
            setShowRestoreBack(true)
          }}>
          Restaurar Backup
        </Button>

        <Button
          style={styles.buttonStyle}
          labelStyle={{ fontSize: 16 }}
          textColor={Colors.colors.text}
          onPress={() => setShowExportDialog(true)}>
          Exportar DB
        </Button>

        <Button
          style={styles.buttonStyle}
          labelStyle={{ fontSize: 16 }}
          textColor={Colors.colors.text}
          onPress={() => { setShowImportDialog(true) }}>
          Importar DB
        </Button>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        {showExportDialog ?
          <DialogComponent
            Title='Exportar Base de Datos'
            Content_text='Al confirmar elige una carpeta donde guardar el archivo'
            onCancel={() => setShowExportDialog(false)}
            onConfirm={async () => {
              await DatabaseManager.exportDatabase();
              setShowExportDialog(false);
            }}
          />
          : null}
        {showImporttDialog ?
          <DialogComponent
            Title='Importar una nueva DB'
            Content_text='Importar una nueva DB implica eliminar la DB actual, desea continuar?'
            onCancel={() => setShowImportDialog(false)}
            onConfirm={async () => {
              await DatabaseManager.pickDatabaseForImport();
              setShowImportDialog(false);
            }}
          />
          : null}
        {showRestoreBack ?
          <DialogComponent
            Title='Restaurar Backup'
            Content_text='Restaurar un backup eliminara los datos actuales, desea continuar?'
            onCancel={() => setShowRestoreBack(false)}
            onConfirm={async () => {
              await DatabaseManager.restoreBackup((await DatabaseManager.listBackups())[0])
              setShowRestoreBack(false);
            }}
          />
          : null}
      </View>
    </>
  );
}

// Tus estilos permanecen igual
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.colors.background,
    flex: 1,
    flexDirection: 'column',
    gap: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    width: '80%',
  },
  buttonStyle: {
    backgroundColor: Colors.colors.complementario,
    borderRadius: 4,
    width: '60%',
  }
});