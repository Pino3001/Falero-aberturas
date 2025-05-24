import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { TextInput, Button, Menu, List, Card, Text, IconButton, Divider, FAB, DataTable } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import VentanaSeleccionada from './VentanaSeleccionada';
import { Dropdown } from 'react-native-element-dropdown';
import { SerieOption, ColorOption, CortinaOption } from '../contexts/BDContext';
const ventanaIcon = require('../assets/images/ventana.png');
const ventana3HojasIcon = require('../assets/images/ventana con 3 hojas.png');
const ventanaCortinaIcon = require('../assets/images/ventana con cortina.png');

export type Ventana = {
  id_abertura_presupuesto?: number;
  largo: string;
  label: string;
  ancho: string;
  vidrio: boolean;
  mosquitero: boolean;
  serie?: SerieOption;
  colorAluminio?: ColorOption;
  cortina?: CortinaOption;
  cantidad: string;
  preciounitario: number;
  precioTotal: number;
};

export default function EditNuevoPresupuesto({ path }: { path: string }) {
  const [mostrarAbertura, setMostrarAbertura] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');

  const handleNombreChange = (texto: string) => {
    setNombreCliente(texto);
    console.log('Nombre ingresado:', texto); // Opcional: ver en consola
  };
  const [abertura, setAbertura] = useState('');
  const aberturasCombo = [
    { label: 'Ventana', value: '1' },
    { label: 'Puerta', value: '2' }
  ];
  const contador = useRef(0);

  const [aberturas, setAberturas] = useState<Ventana[]>([]);

  const handleComfirmarCreacion = (ventana: Ventana) => {
    contador.current += 1;
    setAberturas([...aberturas, { ...ventana, id_abertura_presupuesto: contador.current }]);
    setMostrarAbertura(false);
  }

  const handleEliminarAbertura = (id: number) => {
    const nuevasAberturas = aberturas.filter(ventana => ventana.id_abertura_presupuesto !== id);
    setAberturas(nuevasAberturas);
  };

  return (
    <View style={styles.getStartedContainer}>
      <Card style={styles.card}>
        <Card.Content style={{ flexDirection: 'column', gap: 15, width: '100%' }}>
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
          {<Card style={styles.mensajeContainer}>
            <Card.Title title="Presupuesto" />

            <Card.Content style={{width: '100%'}}>
              <Divider style={{ marginBottom: 8 }} />
              {
                aberturas.length > 0 ? (
                  <View style={styles.listaContainer}>

                    <DataTable style={{paddingHorizontal:0}}>
                      <DataTable.Header style={{paddingHorizontal:0}}>
                        <DataTable.Title>Tipo</DataTable.Title>
                        <DataTable.Title>Serie</DataTable.Title>
                        <DataTable.Title>Dimensiones</DataTable.Title>
                        <DataTable.Title>Cantidad</DataTable.Title>
                        <DataTable.Title>Editar</DataTable.Title>
                        <DataTable.Title>Eliminar</DataTable.Title>
                      </DataTable.Header>

                      {aberturas.map((ventana) => (
                        <DataTable.Row key={ventana.id_abertura_presupuesto} style={{paddingHorizontal:0}}>
                          <DataTable.Cell textStyle={{}}>{ventana.serie?.nombre}</DataTable.Cell>
                          <DataTable.Cell textStyle={{}}>{ventana.serie?.nombre}</DataTable.Cell>
                          <DataTable.Cell textStyle={{}}>{ventana.ancho}X{ventana.largo}</DataTable.Cell>
                          <DataTable.Cell textStyle={{}}>{ventana.cantidad}</DataTable.Cell>
                          <DataTable.Cell textStyle={{}}>{ventana.serie?.nombre}</DataTable.Cell>
                          <DataTable.Cell textStyle={{}}>{ventana.serie?.nombre}</DataTable.Cell>
                        </DataTable.Row>
                      ))}
                    </DataTable>

{/* 
                    {aberturas.map((ventana) => (
                      <List.Item
                        key={ventana.id_abertura_presupuesto}
                        title={`${ventana.cantidad} ${ventana.label}${Number(ventana.cantidad) > 1 ? 's' : ''} - ${ventana.ancho}cm X ${ventana.largo}cm`}
                        style={styles.listItem}
                        titleStyle={styles.listItemTitle}
                        left={() => (
                          <View style={styles.leftIconContainer}>
                            <Image
                              source={
                                ventana.serie?.nombre.includes('3 Hojas')
                                  ? ventana3HojasIcon
                                  : ventana.cortina !== undefined && ventana.cortina?.id > 0
                                    ? ventanaCortinaIcon
                                    : ventanaIcon
                              }
                              style={styles.ventanaIcon}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                        right={props => (
                          <View style={styles.rightIconContainer}>
                            <TouchableOpacity
                              //onPress={() => ()}
                              style={styles.actionButton}
                            >
                              <MaterialCommunityIcons
                                name="pencil"
                                size={24}
                                color="white"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleEliminarAbertura(ventana.id_abertura_presupuesto!)}
                              style={styles.actionButton}
                            >
                              <MaterialCommunityIcons
                                name="delete"
                                size={24}
                                color="#ff6b6b"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      />
                    ) */})
                  </View>
                ) : (
                  <Text style={{ textAlign: 'center', color: 'white' }}>Lista de aberturas vacia!!!</Text>
                )}
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
              {
                aberturas.length > 0 && (
                  <Text style={styles.mensajeTexto}>Precio total: {aberturas.reduce((total, item) => total + item.precioTotal, 0).toFixed(1)} US$</Text>
                )
              }{aberturas.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 10, alignContent: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <TouchableOpacity style={{
                    backgroundColor: '#2EBD2E',
                    borderRadius: 6,
                    height: 30,
                    width: '40%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}> <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Guardar</Text> </TouchableOpacity>
                  <TouchableOpacity style={{
                    backgroundColor: '#BD2E2E',
                    borderRadius: 6,
                    height: 30,
                    width: '40%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}> <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Limpiar</Text> </TouchableOpacity>
                </View>
              )}
            </Card.Content>
          </Card>
          }

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
      </Card >
      {/* View que aparece al presionar el botón "Agregar Aberturas"*/
        /* Muestra todas las aberturas del sistema para ser seleccionadas y agregadas al presupuesto */
      }
      {
        mostrarAbertura && (
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
            {abertura === '1' && <VentanaSeleccionada handleComfirmarCreacion={handleComfirmarCreacion} />}
          </>
        )
      }
    </View >
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
  buttonGuardar: {
    backgroundColor: '#6200ee',
    borderRadius: 6,
    padding: 10,
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
    width: '100%',
    borderRadius: 5,
    padding: 0,
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
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 30,
  },
  listaContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: 14,
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
    width: '98%',
    elevation: 4,
  },
  rightIconContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
