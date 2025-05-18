import React, { useState } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { TextInput, Button, Menu, List, Card, Text } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import VentanaSeleccionada from './VentanaSeleccionada';
import { Dropdown } from 'react-native-element-dropdown';
import ModalSerie from './ModalSerie';

const ventanaIcon = require('../assets/images/ventana.png');
const ventana3HojasIcon = require('../assets/images/ventana con 3 hojas.png');
const ventanaCortinaIcon = require('../assets/images/ventana con cortina.png');

export type Ventana = {
  largo: string;
  label: string;
  ancho: string;
  vidrio: boolean;
  mosquitero: boolean;
  serie: string;
  colorAluminio: string;
  cortina: string;
  cantidad: string;
};

export default function EditNuevoPresupuesto({ path }: { path: string }) {
  const [mostrarAbertura, setMostrarAbertura] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [serieSeleccionada, setSerieSeleccionada] = useState('');

  const handleNombreChange = (texto: string) => {
    setNombreCliente(texto);
    console.log('Nombre ingresado:', texto); // Opcional: ver en consola
  };
  const [visible, setVisible] = useState(false);
  const [abertura, setAbertura] = useState('');
  const aberturasCombo = [
    { label: 'Ventana', value: 'Ventana' },
    { label: 'Puerta', value: 'Puerta' }
  ];

  const [aberturas, setAberturas] = useState<Ventana[]>([]);

  const handleComfirmarCreacion = (ventana: Ventana) => {
    console.log('ventana', ventana);
    setAberturas([...aberturas, ventana]);
    setMostrarAbertura(false);
  }

  const showModal = (serie: string) => {
    setSerieSeleccionada(serie);
    setModalVisible(true);
  };

  const hideModal = () => setModalVisible(false);

  return (
    <View style={styles.getStartedContainer}>
      <Card style={styles.card}>
        <Card.Content style={{ flexDirection: 'column', gap: 15 }}>
          <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
            mode="outlined"
            label="Nombre Cliente"
            placeholder="Nombre Cliente"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            theme={{
              colors: {
                primary: 'white',  // Color primario 
                error: '#f44336',    // Color de error 
              },
            }}
            value={nombreCliente}
            onChangeText={handleNombreChange}
          />
          {
            aberturas.length > 0 ? ( // lista de aberturas agregadas al presupuesto
              <View style={styles.listaContainer}>
                {aberturas.map((ventana, index) => (
                  <List.Item
                    key={index}
                    title={`${ventana.cantidad} ${ventana.label}${Number(ventana.cantidad) > 1 ? 's' : ''} - ${ventana.ancho}cm X ${ventana.largo}cm`}
                    onPress={() => showModal(ventana.serie)}
                    style={styles.listItem}
                    titleStyle={styles.listItemTitle}
                  />
                ))}
              </View>
            ) : (
              <Text style={{ textAlign: 'center', color: 'white' }}>No hay aberturas</Text>
            )}
          <Button // Agregar aberturas al presupuesto
            mode="contained"
            onPress={() => setMostrarAbertura(!mostrarAbertura)}
            icon={() => <FontAwesome name="plus" size={20} color="white" />}
            style={styles.button}
            labelStyle={styles.label}
          >
            Agregar Aberturas
          </Button>
        </Card.Content>
      </Card>
      {/* View que aparece al presionar el botón "Agregar Aberturas"*/
        /* Muestra todas las aberturas del sistema para ser seleccionadas y agregadas al presupuesto */}
      {mostrarAbertura && (
        <>
          <View >
            <Card style={styles.card}>
              <Card.Content>
                <Dropdown
                  data={aberturasCombo}
                  labelField="label"
                  valueField="value"
                  value={abertura}
                  onChange={item => setAbertura(item.value)}
                  placeholder="Seleccione abertura"
                  selectedTextStyle={{ color: 'white', textAlign: 'center', fontSize: 20 }}
                  style={styles.dropdown}
                  placeholderStyle={{ color: 'white', textAlign: 'center', fontSize: 20 }}
                  containerStyle={{ backgroundColor: '#000' }}
                  activeColor="#6200ee"
                  itemTextStyle={{ color: 'white' }}
                  iconColor="white"
                  iconStyle={{
                    width: 34,
                    height: 34,
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </Card.Content>
            </Card>
          </View>
          {abertura === 'Ventana' && <VentanaSeleccionada handleComfirmarCreacion={handleComfirmarCreacion} />}
        </>
      )
      }
      <ModalSerie 
        visible={modalVisible}
        hideModal={hideModal}
        serie={serieSeleccionada}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  containerAberturas: {
    flexDirection: 'row',
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
  dropdown: {
    width: '90%',
    height: 40,
    alignSelf: 'center',
    alignContent: 'center',
    borderColor: 'white', // Color del borde
    borderWidth: 0.3,
    borderRadius: 4,
    backgroundColor: 'grey',
  },
  listItem: {
    paddingVertical: 0,
    minHeight: 30,
  },
  listaContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    alignSelf: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  iconContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingRight: 1,
  },
  leftIconContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingLeft: 8,
    width: 40,
    height: 40,
    alignItems: 'center'
  },
  ventanaIcon: {
    backgroundColor: 'transparent',
    width: 24,
    height: 24,
    tintColor: 'white'
  },
  card: {
    backgroundColor: '#1E1E1E',
    alignSelf: 'center',
    width: '95%',
    elevation: 4,
  },
});
