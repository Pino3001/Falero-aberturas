import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, Menu } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AberturaSeleccionada from './AberturaSeleccionada';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';

import Colors from '@/constants/Colors';

export default function EditNuevoPresupuesto({ path }: { path: string }) {
  const [mostrarAbertura, setMostrarAbertura] = useState(false);

  const [visible, setVisible] = useState(false);
  const [abertura, setAbertura] = useState('');
  const [aberturas] = useState([
    'Juan Pérez',
    'María García',
    'Carlos López',
    'Ana Martínez'
  ]);

  return (
    <View style={styles.getStartedContainer}>
        <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
          mode="outlined"
          label="Nombre Cliente *"
          placeholder="Nombre Cliente"
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
          theme={{
            colors: {
              primary: 'white',  // Color primario 
              error: '#f44336',    // Color de error 
            },
          }}
        />

        <Button // Agregar aberturas al presupuesto
          mode="contained"
          onPress={() => setMostrarAbertura(!mostrarAbertura)}
          icon={() => <FontAwesome name="plus" size={20} color="white" />}
          style={styles.button}
          labelStyle={styles.label}
        >
          Agregar Aberturas
        </Button>
      
      {/* View que aparece al presionar el botón "Agregar Aberturas"*/
        /* Muestra todas las aberturas del sistema para ser seleccionadas y agregadas al presupuesto */}
      {mostrarAbertura && (
        < >
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TextInput
                mode="outlined"
                value={abertura}
                right={<TextInput.Icon icon="menu-down" />}
                style={styles.input}
                theme={{
                  colors: {
                    primary: 'white',
                    error: '#f44336',
                  },
                }}
                onFocus={() => setVisible(true)}
                onTouchStart={() => setVisible(true)}
                caretHidden={true} // evita el carrete
                showSoftInputOnFocus={false} // Evita que aparezca el teclado
              />
            }
          >
            {/*Muestra la lista de aberturas */}
            {aberturas.map((item, index) => (
              <Menu.Item
                key={index}
                onPress={() => {
                  setAbertura(item);
                  setVisible(false);
                }}
                title={item}
              />
            ))}
          </Menu>
          {/* Mensaje condicional, mas adelante debe ir todos los materiales que requiere la abertura seleccionada */
            /* debe de mostrarse el precio de cada material y este puede ser modificado */
            /*tambien debe de aparece una opcion para agregar algun materia extra que no este comunmente incluido en la fabricacion de esa abertura */}
          {abertura === 'María García' && ( //MENSAJES DE PRUEBA
            console.log('Mostrando mensaje para María García'),
              <AberturaSeleccionada/>
          )}
        </>
      )}

    </View>

  );
}

const styles = StyleSheet.create({

  getStartedContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    backgroundColor: 'grey',
    width: '90%',
    height: 40,
    alignSelf: 'center', // Centrar horizontalmente
  },
  button: {
    backgroundColor: '#6200ee', // Color morado de Material Design
    borderRadius: 6,
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  miTexto: {
    fontSize: 16,
    color: 'white',
  },

  mensajeContainer: {
    borderRadius: 5,
    marginTop: 10,
  },
  mensajeTexto: {
    color: 'white',
    textAlign: 'center',
  },
});
