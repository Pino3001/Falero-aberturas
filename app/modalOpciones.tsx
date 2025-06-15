import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import { DatabaseManager, dropTables, initializeDatabase } from '@/utils/_db/utilsDB';
import { Stack } from 'expo-router'; // Importa Stack de expo-router
import DialogComponent from '@/components/DialogComponent';
import { useState } from 'react';
import ThemeToggle from '@/components/themeInteruptor';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@/utils/contexts/ThemeContext';

export default function ModalScreen() {
  const { colors } = useTheme();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImporttDialog, setShowImportDialog] = useState(false);
  const [showRestoreBack, setShowRestoreBack] = useState(false);

  const styles = StyleSheet.create({
    container: {
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
      backgroundColor: colors.primary,
      borderRadius: 4,
      width: '60%',
    }
  });

  return (
    <>
      {/* Configuración del header del modal */}
      <Stack.Screen
        options={{
          title: 'Opciones Generales',
        }}
      />
      <ScrollView>
        <View style={styles.container}>
          <ThemeToggle />
          <Divider style={{borderColor: colors.onBackground, width: '80%'}}></Divider>
          <Text>Opciones de Base de Datos</Text>
          <Button
            style={styles.buttonStyle}
            textColor={colors.onPrimary}
            labelStyle={{ fontSize: 16 }}
            onPress={async () => {
              await dropTables();
              await initializeDatabase();
            }}>
            Eliminar DB
          </Button>

          <Button
            textColor={colors.onPrimary}
            style={styles.buttonStyle}
            labelStyle={{ fontSize: 16 }}
            onPress={async () => {
              await DatabaseManager.createBackup();
            }}>
            Crear Backup
          </Button>

          <Button
            style={styles.buttonStyle}
            textColor={colors.onPrimary}
            labelStyle={{ fontSize: 16 }}
            onPress={() => {
              setShowRestoreBack(true)
            }}>
            Restaurar Backup
          </Button>

          <Button
            style={styles.buttonStyle}
            textColor={colors.onPrimary}
            labelStyle={{ fontSize: 16 }}
            onPress={() => setShowExportDialog(true)}>
            Exportar DB
          </Button>

          <Button
            style={styles.buttonStyle}
            textColor={colors.onPrimary}
            labelStyle={{ fontSize: 16 }}
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
      </ScrollView>
    </>
  );
}

